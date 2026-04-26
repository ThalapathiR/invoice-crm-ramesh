import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { BankService } from '@Service/Pos/Bank.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Bank", version: '1' })
@ApiTags("Bank")
export class BankController extends JWTAuthController {
  constructor(private _BankService: BankService) {
    super();
  }

  @Get('List')
  async List(@Query('storeId') storeId: string) {
    const data = await this._BankService.GetAll(storeId);
    return this.SendResponseData(data);
  }

  @Post('Insert')
  async Insert(@Body() data: any, @CurrentUser() userId: string) {
    const result = await this._BankService.Insert(data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, result.id);
  }

  @Put('Update/:Id')
  async Update(@Param('Id') Id: string, @Body() data: any, @CurrentUser() userId: string) {
    await this._BankService.Update(Id, data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Updated);
  }

  @Delete('Delete/:Id')
  async Delete(@Param('Id') Id: string, @CurrentUser() userId: string) {
    await this._BankService.Delete(Id, userId);
    return this.SendResponse(ResponseEnum.Success, "Bank account deleted successfully");
  }
}
