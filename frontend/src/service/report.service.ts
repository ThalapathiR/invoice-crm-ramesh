import { CommonService } from './commonservice.page';

export class ReportService extends CommonService {
  public static async GetDailySales(storeId: string, startDate: string, endDate: string, paymentMethod: string = 'All') {
    return this.GetAll(`Report/DailySales?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}&paymentMethod=${paymentMethod}`);
  }

  public static async GetMonthlySales(storeId: string, year: number, month: number) {
    return this.GetAll(`Report/MonthlySales?storeId=${storeId}&year=${year}&month=${month}`);
  }

  public static async GetGSTReport(storeId: string, startDate: string, endDate: string) {
    return this.GetAll(`Report/GSTReport?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`);
  }
}
