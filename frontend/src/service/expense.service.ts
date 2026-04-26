import { CommonService } from "./commonservice.page";

export class ExpenseService extends CommonService {
  public static async GetAll(storeId: string) {
    return this.GetAll(`Expense/List?storeId=${storeId}`);
  }

  public static async Insert(data: any) {
    return this.Post("Expense/Insert", data);
  }

  public static async Delete(id: string) {
    return this.DeleteById(`Expense/Delete/${id}`);
  }
}
