import { CommonService } from './commonservice.page';

export class InventoryService extends CommonService {
  public static async AdjustStock(model: any) {
    return this.CommonPost(model, 'Inventory/Adjust');
  }

  public static async GetMovements(productId: string) {
    return this.GetAll(`Inventory/Movements/${productId}`);
  }

  public static async GetLowStock(storeId: string, threshold: number = 10) {
    return this.GetAll(`Inventory/LowStock?storeId=${storeId}&threshold=${threshold}`);
  }
}
