import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "../Admin/company";
import { AuditLogIdentity } from "@Helper/AuditLog.decorators";

@Entity()
@Unique(["barcode", "store_id"])
export class product extends BaseTable {
  @Column()
  @Index()
  barcode: string;

  @Column()
  sku: string;

  @AuditLogIdentity()
  @Column()
  name: string;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: "decimal", precision: 10, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  purchase_price: number;

  @Column({ type: "decimal", precision: 10, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  selling_price: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  gst_percentage: number;

  @Column({ type: "int", default: 0 })
  quantity_in_stock: number;

  @Column({ type: "int", default: 5 })
  reorder_level: number;

  @Column({ type: "boolean", default: false })
  track_batches: boolean;

  @Column({ type: "boolean", default: false })
  track_serials: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0, transformer: { to: (v: any) => v, from: (v: any) => parseFloat(v) } })
  gsm: number;

  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column()
  @Index()
  store_id: string;
}
