import { Injectable } from '@nestjs/common';
import { product_size } from '@Database/Table/Pos/product_size';
import { ProductSizeModel } from '@Model/Pos/ProductSize.model';
import { AuditLogService } from '../Admin/AuditLog.service';
import { LogActionEnum } from '@Helper/Enum/AuditLogEnum';

@Injectable()
export class ProductSizeService {
  constructor(private _AuditLogService: AuditLogService) {}

  async GetAll(storeId: string) {
    return await product_size.find({ where: { store_id: storeId, status: true } });
  }

  async Insert(data: ProductSizeModel, userId: string) {
    const _size = new product_size();
    Object.assign(_size, data);
    _size.created_by_id = userId;
    _size.created_on = new Date();
    await _size.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product_size.name, ActionType: LogActionEnum.Insert, PrimaryId: [_size.id] });
    return _size;
  }

  async Update(id: string, data: ProductSizeModel, userId: string) {
    const _size = await product_size.findOne({ where: { id } });
    if (!_size) throw new Error('Size not found');
    Object.assign(_size, data);
    _size.updated_by_id = userId;
    _size.updated_on = new Date();
    await _size.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product_size.name, ActionType: LogActionEnum.Update, PrimaryId: [_size.id] });
    return _size;
  }

  async Delete(id: string, userId: string) {
    const _size = await product_size.findOne({ where: { id } });
    if (!_size) throw new Error('Size not found');
    _size.status = false;
    _size.updated_by_id = userId;
    _size.updated_on = new Date();
    await _size.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: product_size.name, ActionType: LogActionEnum.Suspend, PrimaryId: [_size.id] });
    return true;
  }
}
