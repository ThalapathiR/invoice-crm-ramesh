import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { ProductCategoryService } from '@Service/Pos/ProductCategory.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { ProductCategoryModel } from '@Model/Pos/ProductCategory.model';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "ProductCategory", version: '1' })
@ApiTags("ProductCategory")
export class ProductCategoryController extends JWTAuthController {
  constructor(private _ProductCategoryService: ProductCategoryService) {
    super();
  }

  @Get('List')
  async List(@Query('storeId') storeId: string) {
    const data = await this._ProductCategoryService.GetAll(storeId);
    return this.SendResponseData(data);
  }

  @Post('Insert')
  async Insert(@Body() data: ProductCategoryModel, @CurrentUser() userId: string) {
    const result = await this._ProductCategoryService.Insert(data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, result.id);
  }

  @Put('Update/:Id')
  async Update(@Param('Id') Id: string, @Body() data: ProductCategoryModel, @CurrentUser() userId: string) {
    await this._ProductCategoryService.Update(Id, data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Updated);
  }

  @Delete('Delete/:Id')
  async Delete(@Param('Id') Id: string, @CurrentUser() userId: string) {
    await this._ProductCategoryService.Delete(Id, userId);
    return this.SendResponse(ResponseEnum.Success, "Category deleted successfully");
  }
}
