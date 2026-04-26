import { CommonService } from './commonservice.page';

export class TenantRoleService extends CommonService {
  public static async GetList() {
    const res = await this.GetAll('tenant-role/List');
    return res.result || [];
  }

  public static async Insert(model: any) {
    return this.CommonPost(model, 'tenant-role/Save');
  }

  public static async Update(id: string, model: any) {
    return this.CommonPost({ ...model, id }, 'tenant-role/Save');
  }

  public static async DeleteRole(id: string) {
    return this.CommonPost({ id }, 'tenant-role/Delete');
  }
}
