import { Injectable } from '@nestjs/common';
import { DataSource, Between } from 'typeorm';
import { invoice } from '@Database/Table/Pos/invoice';
import { customer } from '@Database/Table/Pos/customer';
import { product } from '@Database/Table/Pos/product';
import { invoice_item } from '@Database/Table/Pos/invoice_item';
import { expense } from '@Database/Table/Pos/expense';

@Injectable()
export class DashboardService {
  constructor(private _DataSource: DataSource) { }


  async GetStats(storeId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    if (!endDate) end.setHours(23, 59, 59, 999);

    // Sales in range
    const rangeSales = await invoice.createQueryBuilder('invoice')
      .select('SUM(invoice.total_amount)', 'revenue')
      .addSelect('SUM(invoice.tax_amount)', 'tax')
      .addSelect('SUM(invoice.discount_amount)', 'discount')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start, end })
      .andWhere('invoice.status = true')
      .getRawOne();

    // Cost of Goods Sold in range
    const rangeCost = await invoice_item.createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .select('SUM(item.purchase_price * item.quantity)', 'cost')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start, end })
      .andWhere('invoice.status = true')
      .getRawOne();

    // Expenses in range
    const rangeExpenses = await expense.createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'sum')
      .where('expense.store_id = :storeId', { storeId })
      .andWhere('expense.expense_date BETWEEN :start AND :end', { start, end })
      .andWhere('expense.status = true')
      .getRawOne();


    const totalRevenue = Number(rangeSales?.revenue || 0);
    const totalCost = Number(rangeCost?.cost || 0);
    const totalExp = Number(rangeExpenses?.sum || 0);
    const netProfit = totalRevenue - totalCost - totalExp;

    const totalInvoices = await invoice.count({ where: { store_id: storeId, created_on: Between(start, end), status: true } });
    const totalCustomers = await customer.count({ where: { store_id: storeId, status: true } });
    const totalProducts = await product.count({ where: { store_id: storeId, status: true } });

    // Total Inventory Investment (snapshot - usually current value)
    const totalInvestment = await product.createQueryBuilder('p')
      .select('SUM(p.purchase_price * p.quantity_in_stock)', 'sum')
      .where('p.store_id = :storeId', { storeId })
      .andWhere('p.status = true')
      .getRawOne();

    return {
      todayRevenue: totalRevenue, // Renamed in UI or handled as "Selected Period Revenue"
      totalProfit: netProfit,
      totalInvestment: Number(totalInvestment?.sum || 0),
      totalCustomers,
      totalInvoices,
      totalProducts,
      totalRevenue: totalRevenue,
      totalExpenses: totalExp
    };
  }

  async GetSalesTrend(storeId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const data = await invoice.createQueryBuilder('invoice')
      .select("DATE_TRUNC('day', invoice.created_on)", 'date')
      .addSelect('SUM(invoice.total_amount)', 'amount')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start, end })
      .andWhere('invoice.status = true')
      .groupBy("DATE_TRUNC('day', invoice.created_on)")
      .orderBy("DATE_TRUNC('day', invoice.created_on)", 'ASC')
      .getRawMany();

    return data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: Number(d.amount)
    }));
  }

  async GetPaymentBreakdown(storeId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const data = await invoice.createQueryBuilder('invoice')
      .select('invoice.payment_method', 'method')
      .addSelect('COUNT(invoice.id)', 'count')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start, end })
      .andWhere('invoice.status = true')
      .groupBy('invoice.payment_method')
      .getRawMany();

    return data.map(d => ({
      name: d.method || 'Cash',
      value: Number(d.count)
    }));
  }

  async GetTopProducts(storeId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const data = await invoice_item.createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .leftJoin('item.product', 'product')
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'sold')
      .addSelect('SUM(item.total_price)', 'revenue')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start, end })
      .andWhere('invoice.status = true')
      .groupBy('product.name')
      .orderBy('SUM(item.total_price)', 'DESC')
      .limit(5)
      .getRawMany();

    return data.map(d => ({
      name: d.name || 'Unknown Product',
      sold: Number(d.sold),
      revenue: Number(d.revenue)
    }));
  }

  async GetTopCustomers(storeId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const data = await invoice.createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .select('customer.name', 'name')
      .addSelect('customer.phone', 'phone')
      .addSelect('SUM(invoice.total_amount)', 'spent')
      .addSelect('COUNT(invoice.id)', 'orders')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start, end })
      .andWhere('invoice.status = true')
      .andWhere('invoice.customer_id IS NOT NULL')
      .groupBy('customer.name, customer.phone')
      .orderBy('SUM(invoice.total_amount)', 'DESC')
      .limit(5)
      .getRawMany();

    return data.map(d => ({
      name: d.name || 'Walk-in',
      phone: d.phone,
      spent: Number(d.spent),
      orders: Number(d.orders)
    }));
  }


  async GetExpenseBreakdown(storeId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const data = await expense.createQueryBuilder('expense')
      .leftJoin('expense.category', 'category')
      .select('category.name', 'name')
      .addSelect('SUM(expense.amount)', 'value')
      .where('expense.store_id = :storeId', { storeId })
      .andWhere('expense.expense_date BETWEEN :start AND :end', { start, end })
      .andWhere('expense.status = true')
      .groupBy('category.name')
      .getRawMany();

    return data.map(d => ({
      name: d.name || 'Others',
      value: Number(d.value)
    }));
  }


}
