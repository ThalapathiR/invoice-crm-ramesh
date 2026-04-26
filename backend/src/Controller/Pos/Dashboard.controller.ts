import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from '@Service/Pos/Dashboard.service';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Dashboard", version: '1' })
@ApiTags("Dashboard")
export class DashboardController extends JWTAuthController {
  constructor(private _DashboardService: DashboardService) {
    super();
  }

  @Get('Stats')
  async GetStats(@Query('storeId') storeId: string) {
    const data = await this._DashboardService.GetStats(storeId);
    return this.SendResponseData(data);
  }

  @Get('SalesTrend')
  async GetSalesTrend(@Query('storeId') storeId: string) {
    const data = await this._DashboardService.GetSalesTrend(storeId);
    return this.SendResponseData(data);
  }

  @Get('PaymentBreakdown')
  async GetPaymentBreakdown(@Query('storeId') storeId: string) {
    const data = await this._DashboardService.GetPaymentBreakdown(storeId);
    return this.SendResponseData(data);
  }
}
