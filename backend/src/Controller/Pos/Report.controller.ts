import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from '@Service/Pos/Report.service';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Report", version: '1' })
@ApiTags("Report")
export class ReportController extends JWTAuthController {
  constructor(private _ReportService: ReportService) {
    super();
  }

  @Get('DailySales')
  async DailySales(
    @Query('storeId') storeId: string, 
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('date') date: string,
    @Query('paymentMethod') paymentMethod: string
  ) {
    const start = startDate || date;
    const end = endDate || startDate || date;
    const data = await this._ReportService.GetSalesByRange(storeId, start, end, paymentMethod);
    return this.SendResponseData(data);
  }

  @Get('MonthlySales')
  async MonthlySales(@Query('storeId') storeId: string, @Query('year') year: number, @Query('month') month: number) {
    const data = await this._ReportService.GetMonthlySales(storeId, year, month);
    return this.SendResponseData(data);
  }

  @Get('GSTReport')
  async GSTReport(@Query('storeId') storeId: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const data = await this._ReportService.GetGSTReport(storeId, startDate, endDate);
    return this.SendResponseData(data);
  }

  @Get('SyncCustomerStats')
  async SyncCustomerStats(@Query('storeId') storeId: string) {
    const data = await this._ReportService.SyncCustomerStats(storeId);
    return this.SendResponseData(data);
  }
}
