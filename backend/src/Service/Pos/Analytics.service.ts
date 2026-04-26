import { Injectable } from '@nestjs/common';
import { invoice } from '@Database/Table/Pos/invoice';
import { invoice_item } from '@Database/Table/Pos/invoice_item';
import { product } from '@Database/Table/Pos/product';
import { product_batch } from '@Database/Table/Pos/product_batch';
import { product_serial } from '@Database/Table/Pos/product_serial';
import { expense } from '@Database/Table/Pos/expense';
import { Between } from 'typeorm';

@Injectable()
export class AnalyticsService {
  async GetBillWiseProfit(storeId: string, startDate: Date, endDate: Date) {
    const invoices = await invoice.createQueryBuilder('inv')
      .leftJoinAndSelect('inv.items', 'items')
      .leftJoinAndSelect('inv.customer', 'customer')
      .addSelect('inv.created_on') // Force select hidden column
      .where('inv.store_id = :storeId', { storeId })
      .andWhere('inv.created_on BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('inv.status = true')
      .orderBy('inv.created_on', 'DESC')
      .getMany();

    return invoices.map(inv => {
      let totalCost = 0;
      inv.items.forEach(item => {
        // Fallback to current product purchase price if snapshot is missing (for older bills)
        const cp = item.purchase_price || (item.product as any)?.purchase_price || 0;
        totalCost += cp * item.quantity;
      });

      const totalSP = inv.total_amount;
      const profit = totalSP - totalCost;

      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        customer_name: inv.customer?.name || 'Walk-in',
        created_on: inv.created_on,
        total_sp: totalSP,
        total_cp: totalCost,
        discount: inv.discount_amount,
        profit: profit
      };
    });
  }

  async GetBusinessPNL(storeId: string, startDate: Date, endDate: Date) {
    const invoices = await invoice.find({
      where: {
        store_id: storeId,
        created_on: Between(startDate, endDate),
        status: true
      },
      relations: ['items']
    });

    const expenses = await expense.find({
      where: {
        store_id: storeId,
        expense_date: Between(startDate, endDate),
        status: true
      }
    });

    let totalSales = 0;
    let totalCost = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    invoices.forEach(inv => {
      totalSales += inv.total_amount;
      totalTax += inv.tax_amount;
      totalDiscount += inv.discount_amount;
      
      inv.items.forEach(item => {
        const cp = item.purchase_price || (item.product as any)?.purchase_price || 0;
        totalCost += cp * item.quantity;
      });
    });

    return {
      total_sales: totalSales,
      total_cost: totalCost,
      total_tax: totalTax,
      total_discount: totalDiscount,
      total_expenses: totalExpenses,
      net_profit: totalSales - totalCost - totalExpenses,
      invoice_count: invoices.length
    };
  }

  async GetItemWiseProfit(storeId: string, startDate: Date, endDate: Date) {
    const items = await invoice_item.createQueryBuilder('item')
      .leftJoinAndSelect('item.invoice', 'invoice')
      .leftJoinAndSelect('item.product', 'product')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('invoice.status = true')
      .getMany();

    const stats: Record<string, any> = {};

    items.forEach(item => {
      const productId = item.product_id;
      if (!stats[productId]) {
        stats[productId] = {
          product_id: productId,
          name: item.product?.name || 'Unknown',
          sku: item.product?.sku || '-',
          quantity_sold: 0,
          total_revenue: 0,
          total_cost: 0,
          profit: 0
        };
      }

      const cp = item.purchase_price || item.product?.purchase_price || 0;
      stats[productId].quantity_sold += item.quantity;
      stats[productId].total_revenue += item.total_price;
      stats[productId].total_cost += cp * item.quantity;
    });

    return Object.values(stats).map(s => ({
      ...s,
      profit: s.total_revenue - s.total_cost
    })).sort((a, b) => b.profit - a.profit);
  }

  async GetStockSummary(storeId: string) {
    const products = await product.find({
      where: { store_id: storeId, status: true },
      order: { name: 'ASC' }
    });

    let totalValuation = 0;
    const summary = products.map(p => {
      const stock = p.quantity_in_stock || 0;
      const cp = p.purchase_price || 0;
      const value = stock * cp;
      totalValuation += value;

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        size: p.size,
        quantity: stock,
        purchase_price: cp,
        stock_value: value
      };
    });

    return {
      items: summary,
      total_stock_value: totalValuation,
      total_items: summary.length
    };
  }

  async GetLowStockReport(storeId: string) {
    const products = await product.createQueryBuilder('p')
      .where('p.store_id = :storeId', { storeId })
      .andWhere('p.quantity_in_stock <= p.reorder_level')
      .andWhere('p.status = true')
      .getMany();

    return products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      current_stock: p.quantity_in_stock,
      reorder_level: p.reorder_level,
      suggested_purchase: Math.max(0, (p.reorder_level * 2) - p.quantity_in_stock)
    }));
  }

  async GetCategoryReport(storeId: string, startDate: Date, endDate: Date) {
    const items = await invoice_item.createQueryBuilder('item')
      .leftJoinAndSelect('item.invoice', 'invoice')
      .leftJoinAndSelect('item.product', 'product')
      .where('invoice.store_id = :storeId', { storeId })
      .andWhere('invoice.created_on BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('invoice.status = true')
      .getMany();

    const categoryStats: Record<string, any> = {};

    items.forEach(item => {
      const category = item.product?.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          name: category,
          total_sales: 0,
          total_cost: 0,
          total_quantity: 0,
          profit: 0
        };
      }

      const cp = item.purchase_price || item.product?.purchase_price || 0;
      categoryStats[category].total_sales += item.total_price;
      categoryStats[category].total_cost += cp * item.quantity;
      categoryStats[category].total_quantity += item.quantity;
    });

    return Object.values(categoryStats).map(c => ({
      ...c,
      profit: c.total_sales - c.total_cost
    })).sort((a, b) => b.total_sales - a.total_sales);
  }

  async GetBatchReport(storeId: string) {
    return await product_batch.find({
      where: { store_id: storeId, status: true },
      relations: ['product'],
      order: { purchase_date: 'DESC' }
    });
  }

  async GetSerialReport(storeId: string) {
    return await product_serial.find({
      where: { store_id: storeId, status: true },
      relations: ['product', 'invoice'],
      order: { created_on: 'DESC' }
    });
  }
}
