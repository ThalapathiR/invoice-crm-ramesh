import { CommonService } from "./commonservice.page";

export class ExpenseCategoryService extends CommonService {
  public static async GetList() {
    return super.GetAll("ExpenseCategory/List");
  }

  public static async Insert(data: any) {
    return super.CommonPost(data, "ExpenseCategory/Insert");
  }

  public static async Update(id: string, data: any) {
    return super.CommonPut(data, `ExpenseCategory/Update/${id}`);
  }

  public static async Delete(id: string) {
    return super.CommonDelete(`ExpenseCategory/Delete/${id}`);
  }
}
