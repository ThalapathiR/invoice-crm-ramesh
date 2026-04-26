import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserRoleService } from "@Service/Admin/UserRole.service";
import { UserRoleModel } from "@Model/Admin/UserRole.model";
import { ResponseEnum } from "@Helper/Enum/ResponseEnum";
import { CurrentPayload, CurrentUser } from "@Helper/Common.helper";
import { JWTAuthController } from "@Controller/JWTAuth.controller";

@Controller({ path: "tenant-role", version: '1' })
export class TenantUserRoleController extends JWTAuthController {
  constructor(private _UserRoleService: UserRoleService) {
    super();
  }

  @Get("List")
  async List(@CurrentPayload() payload: any) {
    try {
      const StoreId = payload?.company?.id;
      if (!StoreId) {
        return this.SendResponse(ResponseEnum.Error, "Store ID not found in session");
      }
      const res = await this._UserRoleService.GetByStoreId(StoreId);
      return this.SendResponseData(res);
    } catch (error) {
      return this.SendResponse(ResponseEnum.Error, error.message);
    }
  }

  @Post("Save")
  async Save(@CurrentPayload() payload: any, @CurrentUser() UserId: string, @Body() data: UserRoleModel) {
    try {
      const StoreId = payload?.company?.id;
      let res;
      if (data.id) {
        res = await this._UserRoleService.Update(data.id, data, UserId);
      } else {
        res = await this._UserRoleService.Insert(data, UserId, StoreId);
      }
      return this.SendResponse(ResponseEnum.Success, "Role Saved", res);
    } catch (error) {
      return this.SendResponse(ResponseEnum.Error, error.message);
    }
  }

  @Post("Delete")
  async Delete(@Body() data: { id: string }) {
    try {
      await this._UserRoleService.Delete(data.id);
      return this.SendResponse(ResponseEnum.Success, "Role Deleted");
    } catch (error) {
      return this.SendResponse(ResponseEnum.Error, error.message);
    }
  }
}
