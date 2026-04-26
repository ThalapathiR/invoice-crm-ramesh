import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { expense } from '@Database/Table/Pos/expense';
import { bank_account } from '@Database/Table/Pos/bank_account';
import { AuditLogService } from '../Admin/AuditLog.service';
import { LogActionEnum } from '@Helper/Enum/AuditLogEnum';

@Injectable()
export class ExpenseService {
  constructor(
    private _DataSource: DataSource,
    private _AuditLogService: AuditLogService
  ) {}

  async GetAll(storeId: string) {
    return await expense.find({
      where: { store_id: storeId, status: true },
      relations: ['category', 'bank_account'],
      order: { expense_date: 'DESC' }
    });
  }

  async Insert(data: any, userId: string) {
    const queryRunner = this._DataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exp = new expense();
      Object.assign(exp, data);
      exp.created_by_id = userId;
      exp.created_on = new Date();
      const result = await queryRunner.manager.save(exp);

      // Deduct from bank balance
      if (data.bank_account_id) {
        const bank = await queryRunner.manager.findOne(bank_account, { where: { id: data.bank_account_id } });
        if (bank) {
          bank.current_balance = Number(bank.current_balance) - Number(data.amount);
          await queryRunner.manager.save(bank);
        }
      }

      await queryRunner.commitTransaction();
      this._AuditLogService.AuditEmitEvent({ PerformedType: expense.name, ActionType: LogActionEnum.Insert, PrimaryId: [result.id] });
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async Delete(id: string, userId: string) {
    const exp = await expense.findOneBy({ id });
    if (exp) {
      exp.status = false;
      exp.updated_by_id = userId;
      exp.updated_on = new Date();
      await exp.save();
      this._AuditLogService.AuditEmitEvent({ PerformedType: expense.name, ActionType: LogActionEnum.Delete, PrimaryId: [id] });
    }
  }
}
