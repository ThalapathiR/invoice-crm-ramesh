import { Injectable } from '@nestjs/common';
import { customer } from '@Database/Table/Pos/customer';
import { CustomerModel } from '@Model/Pos/Customer.model';
import { AuditLogService } from '../Admin/AuditLog.service';
import { LogActionEnum } from '@Helper/Enum/AuditLogEnum';

@Injectable()
export class CustomerService {
  constructor(private _AuditLogService: AuditLogService) {}

  async GetAll(storeId?: string) {
    if (storeId) {
      return await customer.find({ where: { store_id: storeId, status: true } });
    }
    return await customer.find({ where: { status: true } });
  }

  async GetById(id: string) {
    return await customer.findOne({ where: { id } });
  }

  async GetByPhone(phone: string, storeId: string) {
    return await customer.findOne({ where: { phone, store_id: storeId } });
  }

  async Insert(data: CustomerModel, userId: string) {
    const _customer = new customer();
    Object.assign(_customer, data);
    _customer.created_by_id = userId;
    _customer.created_on = new Date();
    await _customer.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: customer.name, ActionType: LogActionEnum.Insert, PrimaryId: [_customer.id] });
    return _customer;
  }

  async Update(id: string, data: CustomerModel, userId: string) {
    const _customer = await customer.findOne({ where: { id } });
    if (!_customer) throw new Error('Customer not found');
    Object.assign(_customer, data);
    _customer.updated_by_id = userId;
    _customer.updated_on = new Date();
    await _customer.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: customer.name, ActionType: LogActionEnum.Update, PrimaryId: [_customer.id] });
    return _customer;
  }
}
