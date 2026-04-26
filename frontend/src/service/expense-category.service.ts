import { CommonService } from "./commonservice.page";

export class ExpenseCategoryService extends CommonService {
  public static async GetAll() {
    return this.GetAll("ExpenseCategory/List");
  }

  public static async Insert(data: any) {
    return this.Post("ExpenseCategory/Insert", data);
  }

  public static async Update(id: string, data: any) {
    return this.Put(`ExpenseCategory/Update/${id}`, data);
  }

  public static async Delete(id: string) {
    return this.DeleteById(`ExpenseCategory/Delete/${id}`);
  }
}
