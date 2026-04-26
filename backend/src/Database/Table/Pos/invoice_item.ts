import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { invoice } from "./invoice";
import { product } from "./product";
import { AuditLogIdentity } from "@Helper/AuditLog.decorators";

@Entity()
export class invoice_item extends BaseTable {
  @ManyToOne(() => invoice, (inv) => inv.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_id" })
  invoice: invoice;

  @AuditLogIdentity()
  @Column()
  invoice_id: string;

  @ManyToOne(() => product, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "product_id" })
  product: product;

  @Column()
  product_id: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  unit_price: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  purchase_price: number;

  @Column({ type: "decimal", precision: 5, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  gst_percentage: number;

  @Column({ type: "decimal", precision: 10, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  gst_amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  total_price: number;

  @Column({ default: "PERCENTAGE" })
  discount_type: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  discount_value: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  discount_amount: number;
}
