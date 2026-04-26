import { Injectable } from '@nestjs/common';
import { bank_account } from '@Database/Table/Pos/bank_account';
import { AuditLogService } from '../Admin/AuditLog.service';
import { LogActionEnum } from '@Helper/Enum/AuditLogEnum';

@Injectable()
export class BankService {
  constructor(private _AuditLogService: AuditLogService) {}

  async GetAll(storeId: string) {
    return await bank_account.find({ where: { store_id: storeId, status: true } });
  }

  async Insert(data: any, userId: string) {
    const bank = new bank_account();
    Object.assign(bank, data);
    bank.created_by_id = userId;
    bank.created_on = new Date();
    const result = await bank.save();
    this._AuditLogService.AuditEmitEvent({ PerformedType: bank_account.name, ActionType: LogActionEnum.Insert, PrimaryId: [result.id] });
    return result;
  }

  async Update(id: string, data: any, userId: string) {
    const bank = await bank_account.findOneBy({ id });
    if (bank) {
      Object.assign(bank, data);
      bank.updated_by_id = userId;
      bank.updated_on = new Date();
      await bank.save();
      this._AuditLogService.AuditEmitEvent({ PerformedType: bank_account.name, ActionType: LogActionEnum.Update, PrimaryId: [id] });
    }
  }

  async Delete(id: string, userId: string) {
    const bank = await bank_account.findOneBy({ id });
    if (bank) {
      bank.status = false;
      bank.updated_by_id = userId;
      bank.updated_on = new Date();
      await bank.save();
      this._AuditLogService.AuditEmitEvent({ PerformedType: bank_account.name, ActionType: LogActionEnum.Delete, PrimaryId: [id] });
    }
  }
}
