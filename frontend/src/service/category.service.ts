import { CommonService } from './commonservice.page';

export class CategoryService extends CommonService {
  public static async GetList(storeId: string) {
    return this.GetAll(`ProductCategory/List?storeId=${storeId}`);
  }

  public static async Insert(model: any) {
    return this.CommonPost(model, 'ProductCategory/Insert');
  }

  public static async Update(id: string, model: any) {
    return this.CommonPut(model, `ProductCategory/Update/${id}`);
  }

  public static async DeleteCategory(id: string) {
    return this.Delete(id, 'ProductCategory/Delete');
  }
}
