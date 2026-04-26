import { CommonService } from "./commonservice.page";

export class ExpenseService extends CommonService {
  public static async GetList(storeId: string) {
    return super.GetAll(`Expense/List?storeId=${storeId}`);
  }

  public static async Insert(data: any) {
    return super.CommonPost(data, "Expense/Insert");
  }

  public static async Delete(id: string) {
    return super.CommonDelete(`Expense/Delete/${id}`);
  }
}
