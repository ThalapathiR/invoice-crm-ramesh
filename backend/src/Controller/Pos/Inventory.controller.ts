import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from '@Service/Pos/Inventory.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { StockAdjustmentModel } from '@Model/Pos/StockMovement.model';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Inventory", version: '1' })
@ApiTags("Inventory")
export class InventoryController extends JWTAuthController {
  constructor(private _InventoryService: InventoryService) {
    super();
  }

  @Post('Adjust')
  async Adjust(@Body() data: StockAdjustmentModel, @CurrentUser() userId: string) {
    const result = await this._InventoryService.AdjustStock(data, userId);
    return this.SendResponse(ResponseEnum.Success, "Stock adjusted successfully", result);
  }

  @Get('Movements/:ProductId')
  async Movements(@Param('ProductId') ProductId: string) {
    const data = await this._InventoryService.GetMovements(ProductId);
    return this.SendResponseData(data);
  }

  @Get('LowStock')
  async LowStock(@Query('storeId') storeId: string, @Query('threshold') threshold: number) {
    const data = await this._InventoryService.GetLowStockItems(storeId, threshold);
    return this.SendResponseData(data);
  }
}
