import { Injectable } from '@nestjs/common';
import { product } from '@Database/Table/Pos/product';
import { ProductModel } from '@Model/Pos/Product.model';
import { AuditLogService } from '../Admin/AuditLog.service';
import { LogActionEnum } from '@Helper/Enum/AuditLogEnum';

@Injectable()
export class ProductService {
  constructor(private _AuditLogService: AuditLogService) {}

  async GetAll(storeId?: string) {
    if (storeId && storeId !== "undefined" && storeId !== "null") {
      return await product.find({ where: { store_id: storeId, status: true } });
    }
    return await product.find({ where: { status: true } });
  }

  async GetById(id: string) {
    return await product.findOne({ where: { id } });
  }

  async GetByBarcode(barcode: string, storeId: string) {
    if (!storeId || storeId === "undefined" || storeId === "null") {
      return await product.findOne({ where: { barcode, status: true } });
    }
    return await product.findOne({ where: { barcode, store_id: storeId, status: true } });
  }

  async Search(query: string, storeId: string) {
    const qb = product.createQueryBuilder('product')
      .where('product.status = :status', { status: true })
      .andWhere('(product.name LIKE :q OR product.sku LIKE :q OR product.barcode LIKE :q)', { q: `%${query}%` });
    
    if (storeId && storeId !== "undefined" && storeId !== "null") {
      qb.andWhere('product.store_id = :storeId', { storeId });
    }
    
    return await qb.take(10).getMany();
  }

  async Insert(data: ProductModel, userId: string) {
    // Check for duplicate barcode in this store
    const existing = await this.GetByBarcode(data.barcode, data.store_id);
    if (existing) {
      throw new Error(`Product with barcode "${data.barcode}" already exists in this store.`);
    }

    const _product = new product();
    Object.assign(_product, data);
    _product.created_by_id = userId;
    _product.created_on = new Date();
    await _product.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product.name, ActionType: LogActionEnum.Insert, PrimaryId: [_product.id] });
    return _product;
  }

  async Update(id: string, data: ProductModel, userId: string) {
    const _product = await product.findOne({ where: { id } });
    if (!_product) throw new Error('Product not found');

    // If barcode is changing, check for duplicates
    if (data.barcode !== _product.barcode) {
      const existing = await this.GetByBarcode(data.barcode, data.store_id);
      if (existing) {
        throw new Error(`Another product with barcode "${data.barcode}" already exists.`);
      }
    }

    Object.assign(_product, data);
    _product.updated_by_id = userId;
    _product.updated_on = new Date();
    await _product.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product.name, ActionType: LogActionEnum.Update, PrimaryId: [_product.id] });
    return _product;
  }

  async Delete(id: string, userId: string) {
    const _product = await product.findOne({ where: { id } });
    if (!_product) throw new Error('Product not found');
    _product.status = false;
    _product.updated_by_id = userId;
    _product.updated_on = new Date();
    await _product.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product.name, ActionType: LogActionEnum.Suspend, PrimaryId: [_product.id] });
    return true;
  }
}
