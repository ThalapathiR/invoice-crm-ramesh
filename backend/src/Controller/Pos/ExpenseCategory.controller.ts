import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { expense_category } from '@Database/Table/Admin/expense_category';

@Controller({ path: "ExpenseCategory", version: '1' })
@ApiTags("ExpenseCategory")
export class ExpenseCategoryController extends JWTAuthController {
  constructor() {
    super();
  }

  @Get('List')
  async List() {
    const data = await expense_category.find({ where: { status: true } });
    return this.SendResponseData(data);
  }

  @Post('Insert')
  async Insert(@Body() data: any, @CurrentUser() userId: string) {
    const cat = new expense_category();
    cat.name = data.name;
    cat.description = data.description;
    cat.created_by_id = userId;
    cat.created_on = new Date();
    await cat.save();
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created);
  }

  @Put('Update/:Id')
  async Update(@Param('Id') Id: string, @Body() data: any, @CurrentUser() userId: string) {
    const cat = await expense_category.findOneBy({ id: Id });
    if (cat) {
      cat.name = data.name;
      cat.description = data.description;
      cat.updated_by_id = userId;
      cat.updated_on = new Date();
      await cat.save();
    }
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Updated);
  }

  @Delete('Delete/:Id')
  async Delete(@Param('Id') Id: string, @CurrentUser() userId: string) {
    const cat = await expense_category.findOneBy({ id: Id });
    if (cat) {
      cat.status = false;
      cat.updated_by_id = userId;
      cat.updated_on = new Date();
      await cat.save();
    }
    return this.SendResponse(ResponseEnum.Success, "Deleted");
  }
}
