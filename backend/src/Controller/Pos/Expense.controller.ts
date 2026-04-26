import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { ExpenseService } from '@Service/Pos/Expense.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@Controller({ path: "Expense", version: '1' })
@ApiTags("Expense")
export class ExpenseController extends JWTAuthController {
  constructor(private _ExpenseService: ExpenseService) {
    super();
  }

  @Get('List')
  async List(@Query('storeId') storeId: string) {
    const data = await this._ExpenseService.GetAll(storeId);
    return this.SendResponseData(data);
  }

  @Post('Insert')
  async Insert(@Body() data: any, @CurrentUser() userId: string) {
    const result = await this._ExpenseService.Insert(data, userId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, result.id);
  }

  @Delete('Delete/:Id')
  async Delete(@Param('Id') Id: string, @CurrentUser() userId: string) {
    await this._ExpenseService.Delete(Id, userId);
    return this.SendResponse(ResponseEnum.Success, "Expense deleted successfully");
  }
}
