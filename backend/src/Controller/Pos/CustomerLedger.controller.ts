import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { CustomerLedgerService } from '@Service/Pos/CustomerLedger.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "CustomerLedger", version: '1' })
@ApiTags("CustomerLedger")
export class CustomerLedgerController extends JWTAuthController {
  constructor(private _LedgerService: CustomerLedgerService) {
    super();
  }

  @Get('History/:CustomerId')
  async History(@Param('CustomerId') customerId: string) {
    const data = await this._LedgerService.GetByCustomer(customerId);
    return this.SendResponseData(data);
  }

  @Post('RecordPayment')
  async RecordPayment(@Body() data: any, @CurrentUser() userId: string) {
    const result = await this._LedgerService.RecordPayment(data, userId);
    return this.SendResponse(ResponseEnum.Success, "Payment recorded successfully", result.id);
  }
}
