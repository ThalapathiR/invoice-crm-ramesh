import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as path from 'path';
import { product } from '@Database/Table/Pos/product';
import { customer } from '@Database/Table/Pos/customer';
import { invoice } from '@Database/Table/Pos/invoice';
import { invoice_item } from '@Database/Table/Pos/invoice_item';
import { expense } from '@Database/Table/Pos/expense';
import { bank_account } from '@Database/Table/Pos/bank_account';

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const keyFilePath = path.resolve(process.cwd(), 'google-credentials.json');

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.logger.log('Google Sheets API initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Google Sheets API', error);
    }
  }

  async appendInvoiceRow(invoiceData: any) {
    const row = [
      invoiceData.date,
      invoiceData.invoice_number,
      invoiceData.customer_name || 'Walk-in',
      invoiceData.customer_phone || 'NA',
      invoiceData.total_amount,
      invoiceData.payment_method,
      invoiceData.operator || 'System'
    ];
    return this.appendData('Sales', row);
  }

  async syncReports() {

    // Fetch all invoices with items to calculate profit
    const invoices = await invoice.find({
      relations: ['items'],
      select: ['id', 'invoice_number', 'total_amount', 'created_on'],
      order: { created_on: 'DESC' }
    });

    const dailyMap = new Map<string, { sales: number; profit: number; count: number }>();

    invoices.forEach(inv => {
      const dateKey = new Date(inv.created_on).toISOString().split('T')[0];
      const stats = dailyMap.get(dateKey) || { sales: 0, profit: 0, count: 0 };

      stats.sales += Number(inv.total_amount);
      stats.count += 1;

      // Calculate profit for this invoice
      inv.items.forEach(item => {
        const itemProfit = (Number(item.unit_price) - Number(item.purchase_price)) * Number(item.quantity);
        stats.profit += itemProfit;
      });

      dailyMap.set(dateKey, stats);
    });

    // 1. Daily Report
    const dailyRows = Array.from(dailyMap.entries()).map(([date, stats]) => [
      date,
      stats.sales,
      stats.profit,
      stats.count
    ]);
    await this.clearAndSync('Daily_Report', ['Date', 'Total Sales', 'Total Profit', 'Invoices Count'], dailyRows);

    // 2. Weekly Summary (Simple grouping by week number)
    const weeklyMap = new Map<string, { sales: number; profit: number }>();
    dailyRows.forEach(([date, sales, profit]) => {
      const d = new Date(date as string);
      const weekKey = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`; // Simplified week key
      const stats = weeklyMap.get(weekKey) || { sales: 0, profit: 0 };
      stats.sales += Number(sales);
      stats.profit += Number(profit);
      weeklyMap.set(weekKey, stats);
    });
    const weeklyRows = Array.from(weeklyMap.entries()).map(([week, stats]) => [week, stats.sales, stats.profit]);
    await this.clearAndSync('Weekly_Summary', ['Week', 'Total Sales', 'Total Profit'], weeklyRows);

    // 3. Monthly Summary
    const monthlyMap = new Map<string, { sales: number; profit: number }>();
    dailyRows.forEach(([date, sales, profit]) => {
      const d = new Date(date as string);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const stats = monthlyMap.get(monthKey) || { sales: 0, profit: 0 };
      stats.sales += Number(sales);
      stats.profit += Number(profit);
      monthlyMap.set(monthKey, stats);
    });
    const monthlyRows = Array.from(monthlyMap.entries()).map(([month, stats]) => [month, stats.sales, stats.profit]);
    await this.clearAndSync('Monthly_Summary', ['Month', 'Total Sales', 'Total Profit'], monthlyRows);

    // 4. Dashboard
    const totalSales = dailyRows.reduce((acc, row) => acc + Number(row[1]), 0);
    const totalProfit = dailyRows.reduce((acc, row) => acc + Number(row[2]), 0);
    const dashboardRows = [
      ['Overall Total Sales', `Rs. ${totalSales.toLocaleString()}`],
      ['Overall Total Profit', `Rs. ${totalProfit.toLocaleString()}`],
      ['Total Days Active', dailyRows.length],
      ['Last Updated', new Date().toLocaleString()]
    ];
    await this.clearAndSync('Dashboard', ['Metric', 'Value'], dashboardRows);
  }

  async syncAllData() {

    // Sync Products
    const products = await product.find({ 
      where: { status: true },
      select: ['barcode', 'sku', 'name', 'category', 'selling_price', 'quantity_in_stock', 'created_on', 'created_by_id']
    });
    await this.clearAndSync('Products', ['Created At', 'Barcode', 'SKU', 'Name', 'Category', 'Price', 'Stock', 'Operator'], products.map(p => [
      p.created_on?.toLocaleString(), p.barcode, p.sku, p.name, p.category, p.selling_price, p.quantity_in_stock, p.created_by_id
    ]));

    // Sync Customers
    const customers = await customer.find({ 
      where: { status: true },
      select: ['name', 'phone', 'email', 'address', 'created_on', 'created_by_id']
    });
    await this.clearAndSync('Customers', ['Created At', 'Name', 'Phone', 'Email', 'Address', 'Operator'], customers.map(c => [
      c.created_on?.toLocaleString(), c.name, c.phone, c.email, c.address, c.created_by_id
    ]));

    // Sync Sales
    const sales = await invoice.find({ 
      relations: ['customer'],
      select: ['invoice_number', 'total_amount', 'payment_method', 'created_on', 'created_by_id']
    });
    // Note: relations automatically includes the related object, but we need to ensure created_on is selected for the main entity.
    await this.clearAndSync('Sales', ['Date', 'Invoice No', 'Customer', 'Phone', 'Amount', 'Payment', 'Operator'], sales.map(s => [
      s.created_on?.toLocaleString(), s.invoice_number, s.customer?.name || 'Walk-in', s.customer?.phone || 'NA', s.total_amount, s.payment_method, s.created_by_id
    ]));

    // Sync Expenses
    const expenses = await expense.find({ 
      where: { status: true },
      select: ['notes', 'amount', 'expense_date', 'created_on', 'created_by_id']
    });
    await this.clearAndSync('Expenses', ['Created At', 'Notes', 'Amount', 'Expense Date', 'Operator'], expenses.map(e => [
      e.created_on?.toLocaleString(), e.notes || 'NA', e.amount, e.expense_date, e.created_by_id
    ]));

    // Sync Banks
    const banks = await bank_account.find({ 
      where: { status: true },
      select: ['bank_name', 'account_number', 'ifsc_code', 'current_balance', 'created_on', 'created_by_id']
    });
    await this.clearAndSync('Banks', ['Created At', 'Bank Name', 'Account No', 'IFSC', 'Balance', 'Operator'], banks.map(b => [
      b.created_on?.toLocaleString(), b.bank_name, b.account_number, b.ifsc_code, b.current_balance, b.created_by_id
    ]));

    // Also sync the advanced reports
    await this.syncReports();
  }

  private async ensureSheetExists(sheetId: string, sheetName: string) {
    try {
      const spreadsheet = await this.sheets.spreadsheets.get({ spreadsheetId: sheetId });
      const sheets = spreadsheet.data.sheets || [];
      const sheetExists = sheets.some(s => s.properties?.title === sheetName);

      if (!sheetExists) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: sheetName } } }],
          },
        });
        this.logger.log(`Created new sheet: ${sheetName}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring sheet exists: ${sheetName}`, error);
    }
  }

  async clearAndSync(sheetName: string, headers: string[], rows: any[][]) {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId || !this.sheets) return;

    await this.ensureSheetExists(sheetId, sheetName);

    try {
      // Clear existing content
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:Z`,
      });

      // Update with new content (headers + rows)
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: headers.length > 0 ? [headers, ...rows] : rows,
        },
      });

      this.logger.log(`Successfully synced all ${sheetName} to Google Sheet.`);
      await this.formatSheet(sheetId, sheetName);
    } catch (error) {
      this.logger.error(`Failed to sync ${sheetName}`, error);
    }
  }

  private async formatSheet(spreadsheetId: string, sheetName: string) {
    try {
      const spreadsheet = await this.sheets.spreadsheets.get({ spreadsheetId });
      const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
      if (!sheet) return;

      const sheetId = sheet.properties.sheetId;

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            // 1. Bold and Color Headers
            {
              repeatCell: {
                range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.2, green: 0.2, blue: 0.6 },
                    textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                    horizontalAlignment: 'CENTER'
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
              }
            },
            // 2. Freeze Header Row
            {
              updateSheetProperties: {
                properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
                fields: 'gridProperties.frozenRowCount'
              }
            },
            // 3. Auto-resize columns
            {
              autoResizeDimensions: {
                dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 10 }
              }
            }
          ]
        }
      });
      this.logger.log(`Formatted sheet: ${sheetName}`);
    } catch (error) {
      this.logger.error(`Error formatting sheet: ${sheetName}`, error);
    }
  }

  async appendData(sheetName: string, row: any[]) {
    if (!this.sheets) {
      this.logger.warn('Google Sheets API is not initialized.');
      return;
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      this.logger.warn('GOOGLE_SHEET_ID is not set in the environment variables.');
      return;
    }

    await this.ensureSheetExists(sheetId, sheetName);

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });

      this.logger.log(`Successfully appended data to ${sheetName} in Google Sheet.`);
    } catch (error) {
      this.logger.error(`Failed to append data to ${sheetName}`, error);
    }
  }
}
