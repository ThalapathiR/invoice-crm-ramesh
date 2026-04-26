import { CommonService } from './commonservice.page';

export class PaymentService extends CommonService {
  public static async GetMethods(storeId: string) {
    return this.GetAll(`Payment/Methods?storeId=${storeId}`);
  }

  public static async AddMethod(model: any) {
    return this.CommonPost(model, 'Payment/AddMethod');
  }
}
