import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from '@Service/Pos/Payment.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { PaymentMethodModel } from '@Model/Pos/PaymentMethod.model';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Payment", version: '1' })
@ApiTags("Payment")
export class PaymentController extends JWTAuthController {
  constructor(private _PaymentService: PaymentService) {
    super();
  }

  @Get('Methods')
  async GetMethods(@Query('storeId') storeId: string) {
    const data = await this._PaymentService.GetMethods(storeId);
    return this.SendResponseData(data);
  }

  @Post('AddMethod')
  async AddMethod(@Body() data: PaymentMethodModel, @CurrentUser() userId: string) {
    const result = await this._PaymentService.AddMethod(data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, result.id);
  }
}
