import { CommonService } from './commonservice.page';

export class SizeService extends CommonService {
  public static async GetList(storeId: string) {
    return this.GetAll(`ProductSize/List?storeId=${storeId}`);
  }

  public static async Insert(model: any) {
    return this.CommonPost(model, 'ProductSize/Insert');
  }

  public static async Update(id: string, model: any) {
    return this.CommonPut(model, `ProductSize/Update/${id}`);
  }

  public static async DeleteSize(id: string) {
    return this.Delete(id, 'ProductSize/Delete');
  }
}
