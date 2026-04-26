import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { CustomerService } from '@Service/Pos/Customer.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { CustomerModel } from '@Model/Pos/Customer.model';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Customer", version: '1' })
@ApiTags("Customer")
export class CustomerController extends JWTAuthController {
  constructor(private _CustomerService: CustomerService) {
    super();
  }

  @Get('List')
  async List(@Query('storeId') storeId: string) {
    const data = await this._CustomerService.GetAll(storeId);
    return this.SendResponseData(data);
  }

  @Get('ById/:Id')
  async ById(@Param('Id') Id: string) {
    const data = await this._CustomerService.GetById(Id);
    return this.SendResponseData(data);
  }

  @Get('ByPhone/:Phone')
  async ByPhone(@Param('Phone') Phone: string, @Query('storeId') storeId: string) {
    const data = await this._CustomerService.GetByPhone(Phone, storeId);
    return this.SendResponseData(data);
  }

  @Post('Insert')
  async Insert(@Body() data: CustomerModel, @CurrentUser() userId: string) {
    const result = await this._CustomerService.Insert(data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, result.id);
  }

  @Put('Update/:Id')
  async Update(@Param('Id') Id: string, @Body() data: CustomerModel, @CurrentUser() userId: string) {
    await this._CustomerService.Update(Id, data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Updated);
  }
}
