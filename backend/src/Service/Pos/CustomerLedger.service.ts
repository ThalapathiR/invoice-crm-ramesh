import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { customer_ledger, LedgerType } from '@Database/Table/Pos/customer_ledger';
import { customer } from '@Database/Table/Pos/customer';
import { bank_account } from '@Database/Table/Pos/bank_account';
import { AuditLogService } from '../Admin/AuditLog.service';
import { LogActionEnum } from '@Helper/Enum/AuditLogEnum';

@Injectable()
export class CustomerLedgerService {
  constructor(
    private _DataSource: DataSource,
    private _AuditLogService: AuditLogService
  ) {}

  async GetByCustomer(customerId: string) {
    return await customer_ledger.find({
      where: { customer_id: customerId, status: true },
      order: { created_on: 'ASC' }
    });
  }

  async RecordPayment(data: { customer_id: string, amount: number, payment_method: string, bank_account_id?: string, notes?: string }, userId: string) {
    const queryRunner = this._DataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cust = await queryRunner.manager.findOne(customer, { where: { id: data.customer_id } });
      if (!cust) throw new Error('Customer not found');

      // Update customer balance
      cust.current_balance = Number(cust.current_balance) - Number(data.amount);
      await queryRunner.manager.save(cust);

      // Create Ledger Entry
      const ledger = new customer_ledger();
      ledger.customer_id = data.customer_id;
      ledger.type = LedgerType.PAYMENT;
      ledger.debit = 0;
      ledger.credit = data.amount;
      ledger.balance = cust.current_balance;
      ledger.notes = data.notes || `Payment received via ${data.payment_method}`;
      ledger.created_by_id = userId;
      ledger.created_on = new Date();
      const result = await queryRunner.manager.save(ledger);

      // Update Bank Balance
      if (data.bank_account_id) {
        const bank = await queryRunner.manager.findOne(bank_account, { where: { id: data.bank_account_id } });
        if (bank) {
          bank.current_balance = Number(bank.current_balance) + Number(data.amount);
          await queryRunner.manager.save(bank);
        }
      }

      await queryRunner.commitTransaction();
      this._AuditLogService.AuditEmitEvent({ PerformedType: customer_ledger.name, ActionType: LogActionEnum.Insert, PrimaryId: [result.id] });
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
