import { CommonService } from './commonservice.page';

export class AnalyticsService extends CommonService {
  public static async GetBillWiseProfit(storeId: string, startDate: string, endDate: string) {
    return this.GetAll(`Analytics/BillWiseProfit?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`);
  }

  public static async GetBusinessPNL(storeId: string, startDate: string, endDate: string) {
    return this.GetAll(`Analytics/BusinessPNL?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`);
  }

  public static async GetItemWiseProfit(storeId: string, startDate: string, endDate: string) {
    return this.GetAll(`Analytics/ItemWiseProfit?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`);
  }

  public static async GetStockSummary(storeId: string) {
    return this.GetAll(`Analytics/StockSummary?storeId=${storeId}`);
  }

  public static async GetLowStock(storeId: string) {
    return this.GetAll(`Analytics/LowStock?storeId=${storeId}`);
  }

  public static async GetCategoryReport(storeId: string, startDate: string, endDate: string) {
    return this.GetAll(`Analytics/CategoryReport?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`);
  }

  public static async GetBatchReport(storeId: string) {
    return this.GetAll(`Analytics/BatchReport?storeId=${storeId}`);
  }

  public static async GetSerialReport(storeId: string) {
    return this.GetAll(`Analytics/SerialReport?storeId=${storeId}`);
  }
}
