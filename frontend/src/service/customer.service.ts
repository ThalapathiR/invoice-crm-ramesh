import { CommonService } from './commonservice.page';

export class CustomerService extends CommonService {
  public static async GetList(storeId: string) {
    return this.GetAll(`Customer/List?storeId=${storeId}`);
  }

  public static async GetByPhone(phone: string, storeId: string) {
    return this.GetAll(`Customer/ByPhone/${phone}?storeId=${storeId}`);
  }

  public static async Insert(model: any) {
    return this.CommonPost(model, 'Customer/Insert');
  }

  public static async Update(id: string, model: any) {
    return this.CommonPut(model, `Customer/Update/${id}`);
  }
}
