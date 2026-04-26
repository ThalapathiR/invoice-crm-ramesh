import { Injectable } from '@nestjs/common';
import { payment_method } from '@Database/Table/Pos/payment_method';
import { PaymentMethodModel } from '@Model/Pos/PaymentMethod.model';

@Injectable()
export class PaymentService {
  async GetMethods(storeId: string) {
    return await payment_method.find({ where: { store_id: storeId, is_active: true } });
  }

  async AddMethod(data: PaymentMethodModel, userId: string) {
    const method = new payment_method();
    Object.assign(method, data);
    method.created_by_id = userId;
    method.created_on = new Date();
    await method.save();
    return method;
  }
}
