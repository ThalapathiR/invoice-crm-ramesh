import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { invoice } from '@Database/Table/Pos/invoice';
import { invoice_item } from '@Database/Table/Pos/invoice_item';
import { product } from '@Database/Table/Pos/product';
import { stock_movement } from '@Database/Table/Pos/stock_movement';
import { customer } from '@Database/Table/Pos/customer';
import { product_batch } from '@Database/Table/Pos/product_batch';
import { product_serial, SerialStatus } from '@Database/Table/Pos/product_serial';
import { bank_account } from '@Database/Table/Pos/bank_account';
import { customer_ledger, LedgerType } from '@Database/Table/Pos/customer_ledger';
import { CreateInvoiceModel } from '@Model/Pos/Invoice.model';
import { AuditLogService } from '../Admin/AuditLog.service';
import { LogActionEnum } from '@Helper/Enum/AuditLogEnum';

@Injectable()
export class InvoiceService {
  constructor(
    private _DataSource: DataSource,
    private _AuditLogService: AuditLogService
  ) {}

  async CreateInvoice(data: CreateInvoiceModel, userId: string) {
    const queryRunner = this._DataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 0. Auto-create or find customer if phone is provided
      let customerId = data.customer_id;
      if (!customerId && data.customer_phone) {
        let cust = await queryRunner.manager.findOne(customer, { where: { phone: data.customer_phone, store_id: data.store_id } });
        if (!cust) {
          cust = new customer();
          cust.name = data.customer_name || `Walk-in (${data.customer_phone})`;
          cust.phone = data.customer_phone;
          cust.store_id = data.store_id;
          cust.total_purchases = 0;
          cust.total_invoices = 0;
          cust.current_balance = 0;
          cust.created_by_id = userId;
          cust.created_on = new Date();
          cust = await queryRunner.manager.save(cust);
        }
        customerId = cust.id;
      }

      // 1. Calculate totals
      let subtotal = 0;
      let tax_amount = 0;
      const itemsToSave: invoice_item[] = [];

      for (const itemData of data.items) {
        const prod = await queryRunner.manager.findOne(product, { where: { id: itemData.product_id } });
        if (!prod) throw new Error(`Product ${itemData.product_id} not found`);
        if (prod.quantity_in_stock < itemData.quantity) throw new Error(`Insufficient stock for ${prod.name}`);

        // ITEM DISCOUNT
        let itemDiscount = 0;
        if (itemData.discount_value) {
          if (itemData.discount_type === 'PERCENTAGE') {
            itemDiscount = (itemData.unit_price * itemData.quantity * itemData.discount_value) / 100;
          } else {
            itemDiscount = itemData.discount_value;
          }
        }

        const itemSubtotal = (itemData.unit_price * itemData.quantity) - itemDiscount;
        const itemTax = (itemSubtotal * itemData.gst_percentage) / 100;

        subtotal += itemSubtotal;
        tax_amount += itemTax;

        // BATCH & COST CALCULATION (FIFO)
        let costPrice = prod.purchase_price || 0;
        if (prod.track_batches) {
          let remainingToDeduct = itemData.quantity;
          let calculatedTotalCost = 0;
          
          const batches = await queryRunner.manager.find(product_batch, {
            where: { product_id: prod.id, store_id: data.store_id },
            order: { purchase_date: 'ASC' }
          });

          for (const batch of batches) {
            if (batch.current_quantity <= 0) continue;
            
            const deductFromThisBatch = Math.min(batch.current_quantity, remainingToDeduct);
            batch.current_quantity -= deductFromThisBatch;
            calculatedTotalCost += deductFromThisBatch * batch.cost_price;
            remainingToDeduct -= deductFromThisBatch;
            
            await queryRunner.manager.save(batch);
            if (remainingToDeduct <= 0) break;
          }

          if (remainingToDeduct > 0) {
            calculatedTotalCost += remainingToDeduct * (prod.purchase_price || 0);
          }
          
          costPrice = calculatedTotalCost / itemData.quantity;
        }

        const invItem = new invoice_item();
        invItem.product_id = itemData.product_id;
        invItem.quantity = itemData.quantity;
        invItem.unit_price = itemData.unit_price;
        invItem.purchase_price = costPrice;
        invItem.gst_percentage = itemData.gst_percentage;
        invItem.gst_amount = itemTax;
        invItem.total_price = itemSubtotal + itemTax;
        invItem.discount_type = itemData.discount_type || 'PERCENTAGE';
        invItem.discount_value = itemData.discount_value || 0;
        invItem.discount_amount = itemDiscount;
        invItem.created_by_id = userId;
        invItem.created_on = new Date();
        itemsToSave.push(invItem);

        // SERIAL TRACKING
        if (prod.track_serials && itemData.serial_numbers) {
          for (const sn of itemData.serial_numbers) {
            const serial = await queryRunner.manager.findOne(product_serial, { 
              where: { serial_number: sn, product_id: prod.id, store_id: data.store_id } 
            });
            if (serial) {
              serial.serial_status = SerialStatus.SOLD;
              await queryRunner.manager.save(serial);
            }
          }
        }

        // Update stock
        prod.quantity_in_stock -= itemData.quantity;
        await queryRunner.manager.save(prod);

        // Stock movement log
        const movement = new stock_movement();
        movement.product_id = prod.id;
        movement.movement_type = 'OUT';
        movement.quantity = itemData.quantity;
        movement.created_by_id = userId;
        movement.created_on = new Date();
        await queryRunner.manager.save(movement);
      }

      const billDiscount = (subtotal * (data.discount_percentage || 0)) / 100;
      const flatDiscount = data.discount_amount || 0;
      const total_amount = Math.max(0, subtotal + tax_amount - billDiscount - flatDiscount);
      const paid_amount = data.paid_amount ?? total_amount;
      const due_amount = Math.max(0, total_amount - paid_amount);

      // 2. Create invoice
      const inv = new invoice();
      inv.invoice_number = `INV-${Date.now()}`; 
      inv.customer_id = customerId;
      inv.store_id = data.store_id;
      inv.subtotal = subtotal;
      inv.tax_amount = tax_amount;
      inv.total_amount = total_amount;
      inv.discount_percentage = data.discount_percentage || 0;
      inv.discount_amount = flatDiscount;
      inv.payment_method = data.payment_method;
      inv.bank_account_id = data.bank_account_id;
      inv.upi_reference = data.upi_reference;
      inv.paid_amount = paid_amount;
      inv.due_amount = due_amount;
      inv.created_by_id = userId;
      inv.created_on = new Date();
      
      const savedInvoice = await queryRunner.manager.save(inv);

      // Link items to invoice and link serials
      for (const item of itemsToSave) {
        item.invoice_id = savedInvoice.id;
        await queryRunner.manager.save(item);

        await queryRunner.manager.update(product_serial, 
          { product_id: item.product_id, serial_status: SerialStatus.SOLD, invoice_id: null }, 
          { invoice_id: savedInvoice.id }
        );
      }

      // 3. Update Bank Balance if payment was made
      if (paid_amount > 0 && data.bank_account_id) {
        const bank = await queryRunner.manager.findOne(bank_account, { where: { id: data.bank_account_id } });
        if (bank) {
          bank.current_balance = Number(bank.current_balance) + paid_amount;
          await queryRunner.manager.save(bank);
        }
      }

      // 4. Update Customer Ledger & Balance
      if (customerId) {
        const cust = await queryRunner.manager.findOne(customer, { where: { id: customerId } });
        if (cust) {
          cust.total_purchases = Number(cust.total_purchases) + total_amount;
          cust.total_invoices = Number(cust.total_invoices) + 1;
          cust.current_balance = Number(cust.current_balance) + due_amount;
          cust.last_visit = new Date();
          await queryRunner.manager.save(cust);

          // Create Ledger Entry
          const ledger = new customer_ledger();
          ledger.customer_id = customerId;
          ledger.invoice_id = savedInvoice.id;
          ledger.type = LedgerType.SALE;
          ledger.debit = total_amount;
          ledger.credit = paid_amount;
          ledger.balance = cust.current_balance;
          ledger.notes = `Invoice ${savedInvoice.invoice_number} created`;
          ledger.created_by_id = userId;
          ledger.created_on = new Date();
          await queryRunner.manager.save(ledger);
        }
      }

      await queryRunner.commitTransaction();
      this._AuditLogService.AuditEmitEvent({ PerformedType: invoice.name, ActionType: LogActionEnum.Insert, PrimaryId: [savedInvoice.id] });
      return savedInvoice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async GetAll(storeId?: string) {
    const query = invoice.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.product', 'product');
    
    if (storeId) {
      query.where('invoice.store_id = :storeId', { storeId });
    }
    
    return await query.getMany();
  }

  async GetById(id: string) {
    return await invoice.findOne({ 
      where: { id }, 
      relations: ['customer', 'items', 'items.product'] 
    });
  }

  async GetByCustomer(customerId: string) {
    return await invoice.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('invoice.customer_id = :customerId', { customerId })
      .orderBy('invoice.created_on', 'DESC')
      .getMany();
  }
}
