import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { InvoiceService } from '@Service/Pos/Invoice.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { CreateInvoiceModel } from '@Model/Pos/Invoice.model';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Invoice", version: '1' })
@ApiTags("Invoice")
export class InvoiceController extends JWTAuthController {
  constructor(private _InvoiceService: InvoiceService) {
    super();
  }

  @Post('Checkout')
  async Checkout(@Body() data: CreateInvoiceModel, @CurrentUser() userId: string) {
    const result = await this._InvoiceService.CreateInvoice(data, userId);
    return this.SendResponse(ResponseEnum.Success, "Invoice created successfully", result);
  }

  @Get('List')
  async List(@Query('storeId') storeId: string) {
    const data = await this._InvoiceService.GetAll(storeId);
    return this.SendResponseData(data);
  }

  @Get('ById/:Id')
  async ById(@Param('Id') Id: string) {
    const data = await this._InvoiceService.GetById(Id);
    return this.SendResponseData(data);
  }

  @Get('ByCustomer/:CustomerId')
  async ByCustomer(@Param('CustomerId') CustomerId: string) {
    const data = await this._InvoiceService.GetByCustomer(CustomerId);
    return this.SendResponseData(data);
  }
}
