import { Injectable } from '@nestjs/common';
import { product_category } from '@Database/Table/Pos/product_category';
import { ProductCategoryModel } from '@Model/Pos/ProductCategory.model';
import { AuditLogService } from '../Admin/AuditLog.service';
import { LogActionEnum } from '@Helper/Enum/AuditLogEnum';

@Injectable()
export class ProductCategoryService {
  constructor(private _AuditLogService: AuditLogService) {}

  async GetAll(storeId: string) {
    return await product_category.find({ where: { store_id: storeId, status: true } });
  }

  async Insert(data: ProductCategoryModel, userId: string) {
    const _category = new product_category();
    Object.assign(_category, data);
    _category.created_by_id = userId;
    _category.created_on = new Date();
    await _category.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product_category.name, ActionType: LogActionEnum.Insert, PrimaryId: [_category.id] });
    return _category;
  }

  async Update(id: string, data: ProductCategoryModel, userId: string) {
    const _category = await product_category.findOne({ where: { id } });
    if (!_category) throw new Error('Category not found');
    Object.assign(_category, data);
    _category.updated_by_id = userId;
    _category.updated_on = new Date();
    await _category.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product_category.name, ActionType: LogActionEnum.Update, PrimaryId: [_category.id] });
    return _category;
  }

  async Delete(id: string, userId: string) {
    const _category = await product_category.findOne({ where: { id } });
    if (!_category) throw new Error('Category not found');
    _category.status = false;
    _category.updated_by_id = userId;
    _category.updated_on = new Date();
    await _category.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product_category.name, ActionType: LogActionEnum.Suspend, PrimaryId: [_category.id] });
    return true;
  }
}
