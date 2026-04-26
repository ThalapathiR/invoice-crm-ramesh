import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "@Service/Admin/User.service";
import { UserModel } from "@Model/Admin/User.model";
import { ResponseEnum } from "@Helper/Enum/ResponseEnum";
import { CurrentPayload, CurrentUser } from "@Helper/Common.helper";
import { JWTAuthController } from "@Controller/JWTAuth.controller";

@Controller({ path: "employee", version: '1' })
export class EmployeeController extends JWTAuthController {
  constructor(private _UserService: UserService) {
    super();
  }

  @Get("List")
  async List(@CurrentPayload() payload: any) {
    try {
      const StoreId = payload?.company?.id;
      if (!StoreId) {
        return this.SendResponse(ResponseEnum.Error, "Store ID not found in session");
      }
      const res = await this._UserService.GetEmployeesByStoreId(StoreId);
      return this.SendResponseData(res);
    } catch (error) {
      return this.SendResponse(ResponseEnum.Error, error.message);
    }
  }

  @Post("Save")
  async Save(@CurrentPayload() payload: any, @CurrentUser() UserId: string, @Body() data: UserModel) {
    try {
      const StoreId = payload?.company?.id;
      let res;
      if (data.id) {
        res = await this._UserService.Update(data.id, data, UserId);
      } else {
        (data as any).store_id = StoreId;
        res = await this._UserService.Insert(data, UserId);
      }
      return this.SendResponse(ResponseEnum.Success, "Employee Saved", res);
    } catch (error) {
      return this.SendResponse(ResponseEnum.Error, error.message);
    }
  }

  @Post("ToggleStatus")
  async ToggleStatus(@CurrentUser() UserId: string, @Body() data: { id: string }) {
    try {
      const res = await this._UserService.SuspendOrActivate(data.id, UserId);
      return this.SendResponse(ResponseEnum.Success, "Status Updated", res);
    } catch (error) {
      return this.SendResponse(ResponseEnum.Error, error.message);
    }
  }
}
