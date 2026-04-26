import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { invoice } from '@Database/Table/Pos/invoice';
import { customer } from '@Database/Table/Pos/customer';

@Injectable()
export class ReportService {
  constructor(private _DataSource: DataSource) { }

  async GetSalesByRange(storeId: string, startDate: string, endDate: string, paymentMethod?: string) {
    const qb = invoice.createQueryBuilder('invoice')
      .addSelect('invoice.created_on')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on >= :startDate AND invoice.created_on <= :endDate', { 
        startDate: startDate + " 00:00:00", 
        endDate: endDate + " 23:59:59" 
      });

    if (paymentMethod && paymentMethod !== 'All') {
      qb.andWhere('invoice.payment_method = :paymentMethod', { paymentMethod });
    }

    return await qb.orderBy('invoice.created_on', 'DESC').getMany();
  }

  async GetMonthlySales(storeId: string, year: number, month: number) {
    return await invoice.createQueryBuilder('invoice')
      .addSelect('invoice.created_on')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('EXTRACT(YEAR FROM invoice.created_on) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM invoice.created_on) = :month', { month })
      .getMany();
  }

  async GetGSTReport(storeId: string, startDate: string, endDate: string) {
    const invoices = await invoice.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on >= :startDate AND invoice.created_on <= :endDate', { 
        startDate: startDate + " 00:00:00", 
        endDate: endDate + " 23:59:59" 
      })
      .getMany();

    const reportMap = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const gst = item.gst_percentage;
        if (!reportMap[gst]) {
          reportMap[gst] = { gst_percentage: gst, taxable_value: 0, gst_amount: 0, total: 0 };
        }
        reportMap[gst].taxable_value += Number(item.unit_price) * Number(item.quantity);
        reportMap[gst].gst_amount += Number(item.gst_amount);
        reportMap[gst].total += Number(item.total_price);
      });
    });

    return Object.values(reportMap);
  }

  async SyncCustomerStats(storeId: string) {
    const customers = await customer.find({ where: { store_id: storeId } });
    
    for (const cust of customers) {
      const stats = await invoice.createQueryBuilder('invoice')
        .select('COUNT(invoice.id)', 'count')
        .addSelect('MAX(invoice.created_on)', 'last_visit')
        .where('invoice.customer_id = :customerId', { customerId: cust.id })
        .getRawOne();
      
      if (stats) {
        cust.total_invoices = Number(stats.count);
        cust.last_visit = stats.last_visit ? new Date(stats.last_visit) : null;
        await customer.save(cust);
      }
    }
    return { message: `${customers.length} customers synced successfully` };
  }
}