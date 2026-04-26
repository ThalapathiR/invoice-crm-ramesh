import { CommonService } from "./commonservice.page";

export class BankService extends CommonService {
  public static async GetAll(storeId: string) {
    return CommonService.GetAll(`Bank/List?storeId=${storeId}`);
  }

  public static async Insert(data: any) {
    return CommonService.CommonPost(data, "Bank/Insert");
  }

  public static async Update(id: string, data: any) {
    return CommonService.CommonPut(data, `Bank/Update/${id}`);
  }

  public static async Delete(id: string) {
    return CommonService.Delete(id, "Bank/Delete");
  }
}
