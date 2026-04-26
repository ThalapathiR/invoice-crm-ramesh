import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { ProductSizeService } from '@Service/Pos/ProductSize.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { ProductSizeModel } from '@Model/Pos/ProductSize.model';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "ProductSize", version: '1' })
@ApiTags("ProductSize")
export class ProductSizeController extends JWTAuthController {
  constructor(private _ProductSizeService: ProductSizeService) {
    super();
  }

  @Get('List')
  async List(@Query('storeId') storeId: string) {
    const data = await this._ProductSizeService.GetAll(storeId);
    return this.SendResponseData(data);
  }

  @Post('Insert')
  async Insert(@Body() data: ProductSizeModel, @CurrentUser() userId: string) {
    const result = await this._ProductSizeService.Insert(data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, result.id);
  }

  @Put('Update/:Id')
  async Update(@Param('Id') Id: string, @Body() data: ProductSizeModel, @CurrentUser() userId: string) {
    await this._ProductSizeService.Update(Id, data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Updated);
  }

  @Delete('Delete/:Id')
  async Delete(@Param('Id') Id: string, @CurrentUser() userId: string) {
    await this._ProductSizeService.Delete(Id, userId);
    return this.SendResponse(ResponseEnum.Success, "Size deleted successfully");
  }
}
