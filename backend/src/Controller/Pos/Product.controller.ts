import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from '@Service/Pos/Product.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { ProductModel } from '@Model/Pos/Product.model';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Product", version: '1' })
@ApiTags("Product")
export class ProductController extends JWTAuthController {
  constructor(private _ProductService: ProductService) {
    super();
  }

  @Get('List')
  async List(@Query('storeId') storeId: string) {
    const data = await this._ProductService.GetAll(storeId);
    return this.SendResponseData(data);
  }

  @Get('ById/:Id')
  async ById(@Param('Id') Id: string) {
    const data = await this._ProductService.GetById(Id);
    return this.SendResponseData(data);
  }

  @Get('ByBarcode/:Barcode')
  async ByBarcode(@Param('Barcode') Barcode: string, @Query('storeId') storeId: string) {
    const data = await this._ProductService.GetByBarcode(Barcode, storeId);
    return this.SendResponseData(data);
  }

  @Get('Search')
  async Search(@Query('q') q: string, @Query('storeId') storeId: string) {
    const data = await this._ProductService.Search(q, storeId);
    return this.SendResponseData(data);
  }

  @Post('Insert')
  async Insert(@Body() data: ProductModel, @CurrentUser() userId: string) {
    const result = await this._ProductService.Insert(data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, result.id);
  }

  @Put('Update/:Id')
  async Update(@Param('Id') Id: string, @Body() data: ProductModel, @CurrentUser() userId: string) {
    await this._ProductService.Update(Id, data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Updated);
  }

  @Delete('Delete/:Id')
  async Delete(@Param('Id') Id: string, @CurrentUser() userId: string) {
    await this._ProductService.Delete(Id, userId);
    return this.SendResponse(ResponseEnum.Success, "Product deleted successfully");
  }
}
