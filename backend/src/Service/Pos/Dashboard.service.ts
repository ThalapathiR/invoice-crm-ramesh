import { Injectable } from '@nestjs/common';
import { DataSource, Between } from 'typeorm';
import { invoice } from '@Database/Table/Pos/invoice';
import { customer } from '@Database/Table/Pos/customer';
import { product } from '@Database/Table/Pos/product';

@Injectable()
export class DashboardService {
  constructor(private _DataSource: DataSource) { }

  async GetStats(storeId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's Sales
    const todaySales = await invoice.createQueryBuilder('invoice')
      .select('SUM(invoice.total_amount)', 'revenue')
      .addSelect('SUM(invoice.tax_amount)', 'tax')
      .addSelect('SUM(invoice.discount_amount)', 'discount')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
      .andWhere('invoice.status = true')
      .getRawOne();

    // Today's Cost of Goods Sold (using snapshots)
    const todayCost = await this._DataSource.getRepository('invoice_item')
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .select('SUM(item.purchase_price * item.quantity)', 'cost')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
      .andWhere('invoice.status = true')
      .getRawOne();

    // Today's Expenses
    const todayExpenses = await this._DataSource.getRepository('expense')
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'sum')
      .where('expense.store_id = :storeId', { storeId })
      .andWhere('expense.expense_date BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
      .andWhere('expense.status = true')
      .getRawOne();

    const totalRevenue = Number(todaySales?.revenue || 0);
    const totalCost = Number(todayCost?.cost || 0);
    const totalExp = Number(todayExpenses?.sum || 0);
    const netProfit = totalRevenue - totalCost - totalExp;

    const totalInvoices = await invoice.count({ where: { store_id: storeId, created_on: Between(todayStart, todayEnd), status: true } });
    const totalCustomers = await customer.count({ where: { store_id: storeId, status: true } });
    const totalProducts = await product.count({ where: { store_id: storeId, status: true } });

    // Total Inventory Investment
    const totalInvestment = await product.createQueryBuilder('p')
      .select('SUM(p.purchase_price * p.quantity_in_stock)', 'sum')
      .where('p.store_id = :storeId', { storeId })
      .andWhere('p.status = true')
      .getRawOne();

    return {
      todayRevenue: totalRevenue,
      totalProfit: netProfit, // Today's Net Profit
      totalInvestment: Number(totalInvestment?.sum || 0),
      totalCustomers,
      totalInvoices,
      totalProducts,
      totalRevenue: totalRevenue // Alias for legacy UI if needed
    };
  }

  async GetSalesTrend(storeId: string) {
    // Last 7 days trend
    const data = await invoice.createQueryBuilder('invoice')
      .select("DATE_TRUNC('day', invoice.created_on)", 'date')
      .addSelect('SUM(invoice.total_amount)', 'amount')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere("invoice.created_on >= NOW() - INTERVAL '7 days'")
      .andWhere('invoice.status = true')
      .groupBy("DATE_TRUNC('day', invoice.created_on)")
      .orderBy("DATE_TRUNC('day', invoice.created_on)", 'ASC')
      .getRawMany();

    return data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: Number(d.amount)
    }));
  }

  async GetPaymentBreakdown(storeId: string) {
    const data = await invoice.createQueryBuilder('invoice')
      .select('invoice.payment_method', 'method')
      .addSelect('COUNT(invoice.id)', 'count')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.status = true')
      .groupBy('invoice.payment_method')
      .getRawMany();

    return data.map(d => ({
      name: d.method || 'Cash',
      value: Number(d.count)
    }));
  }
}
