import { CommonService } from "./commonservice.page";

export class CustomerLedgerService extends CommonService {
  public static async GetHistory(customerId: string) {
    return this.GetAll(`CustomerLedger/History/${customerId}`);
  }

  public static async RecordPayment(data: any) {
    return this.Post("CustomerLedger/RecordPayment", data);
  }
}
