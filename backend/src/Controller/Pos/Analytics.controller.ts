import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '@Service/Pos/Analytics.service';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Analytics", version: '1' })
@ApiTags("Analytics")
export class AnalyticsController extends JWTAuthController {
  constructor(private _AnalyticsService: AnalyticsService) {
    super();
  }

  @Get('BillWiseProfit')
  async BillWiseProfit(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const data = await this._AnalyticsService.GetBillWiseProfit(
      storeId, 
      new Date(startDate), 
      end
    );
    return this.SendResponseData(data);
  }

  @Get('BusinessPNL')
  async BusinessPNL(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const data = await this._AnalyticsService.GetBusinessPNL(
      storeId, 
      new Date(startDate), 
      end
    );
    return this.SendResponseData(data);
  }

  @Get('ItemWiseProfit')
  async ItemWiseProfit(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const data = await this._AnalyticsService.GetItemWiseProfit(
      storeId, 
      new Date(startDate), 
      end
    );
    return this.SendResponseData(data);
  }

  @Get('StockSummary')
  async StockSummary(@Query('storeId') storeId: string) {
    const data = await this._AnalyticsService.GetStockSummary(storeId);
    return this.SendResponseData(data);
  }

  @Get('LowStock')
  async LowStock(@Query('storeId') storeId: string) {
    const data = await this._AnalyticsService.GetLowStockReport(storeId);
    return this.SendResponseData(data);
  }

  @Get('CategoryReport')
  async CategoryReport(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const data = await this._AnalyticsService.GetCategoryReport(
      storeId, 
      new Date(startDate), 
      end
    );
    return this.SendResponseData(data);
  }

  @Get('BatchReport')
  async BatchReport(@Query('storeId') storeId: string) {
    const data = await this._AnalyticsService.GetBatchReport(storeId);
    return this.SendResponseData(data);
  }

  @Get('SerialReport')
  async SerialReport(@Query('storeId') storeId: string) {
    const data = await this._AnalyticsService.GetSerialReport(storeId);
    return this.SendResponseData(data);
  }
}
