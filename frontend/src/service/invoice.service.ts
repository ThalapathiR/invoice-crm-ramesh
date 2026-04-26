import { CommonService } from './commonservice.page';

export class InvoiceService extends CommonService {
  public static async Checkout(model: any) {
    return this.CommonPost(model, 'Invoice/Checkout');
  }

  public static async GetList(storeId: string) {
    return this.GetAll(`Invoice/List?storeId=${storeId}`);
  }

  public static async GetById(id: string) {
    return this.GetAll(`Invoice/ById/${id}`);
  }

  public static async GetByCustomer(customerId: string) {
    return this.GetAll(`Invoice/ByCustomer/${customerId}`);
  }
}
