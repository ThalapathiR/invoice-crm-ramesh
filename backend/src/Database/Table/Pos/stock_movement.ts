import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { product } from "./product";
import { AuditLogIdentity } from "@Helper/AuditLog.decorators";

@Entity()
export class stock_movement extends BaseTable {
  @ManyToOne(() => product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: product;

  @AuditLogIdentity()
  @Column()
  @Index()
  product_id: string;

  @Column()
  movement_type: string; // IN, OUT, ADJUSTMENT

  @Column({ type: "int" })
  quantity: number;

  @Column({ nullable: true })
  reference_id: string; // Invoice ID or Adjustment Reason
}
