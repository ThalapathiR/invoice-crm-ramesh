import { CommonService } from './commonservice.page';

export class ProductService extends CommonService {
  public static async GetList(storeId: string) {
    return this.GetAll(`Product/List?storeId=${storeId}`);
  }

  public static async GetByBarcode(barcode: string, storeId: string) {
    return this.GetAll(`Product/ByBarcode/${barcode}?storeId=${storeId}`);
  }

  public static async Search(query: string, storeId: string) {
    return this.GetAll(`Product/Search?q=${query}&storeId=${storeId}`, false); // false = don't show global loader for autocomplete
  }

  public static async Insert(model: any) {
    return this.CommonPost(model, 'Product/Insert');
  }

  public static async Update(id: string, model: any) {
    return this.CommonPut(model, `Product/Update/${id}`);
  }

  public static async DeleteProduct(id: string) {
    return this.Delete(id, 'Product/Delete');
  }
}
