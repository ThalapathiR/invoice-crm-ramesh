import { Injectable } from '@nestjs/common';
import { product } from '@Database/Table/Pos/product';
import { stock_movement } from '@Database/Table/Pos/stock_movement';
import { StockAdjustmentModel } from '@Model/Pos/StockMovement.model';
import { DataSource } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(private _DataSource: DataSource) {}

  async AdjustStock(data: StockAdjustmentModel, userId: string) {
    const queryRunner = this._DataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const prod = await queryRunner.manager.findOne(product, { where: { id: data.product_id } });
      if (!prod) throw new Error('Product not found');

      if (data.movement_type === 'IN') {
        prod.quantity_in_stock += data.quantity;
      } else if (data.movement_type === 'OUT') {
        prod.quantity_in_stock -= data.quantity;
      }
      await queryRunner.manager.save(prod);

      const movement = new stock_movement();
      movement.product_id = prod.id;
      movement.movement_type = data.movement_type;
      movement.quantity = data.quantity;
      movement.reference_id = data.reference_id;
      movement.created_by_id = userId;
      movement.created_on = new Date();
      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
      return prod;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async GetMovements(productId: string) {
    return await stock_movement.find({ where: { product_id: productId }, order: { created_on: 'DESC' } });
  }

  async GetLowStockItems(storeId: string, threshold: number = 10) {
    return await product.createQueryBuilder('product')
      .where('product.store_id = :storeId', { storeId })
      .andWhere('product.quantity_in_stock <= :threshold', { threshold })
      .getMany();
  }
}
