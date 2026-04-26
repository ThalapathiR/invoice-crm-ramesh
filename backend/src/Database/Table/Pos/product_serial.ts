import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { product } from "./product";
import { product_batch } from "./product_batch";
import { invoice } from "./invoice";

export enum SerialStatus {
  IN_STOCK = "IN_STOCK",
  SOLD = "SOLD",
  RETURNED = "RETURNED"
}

@Entity()
export class product_serial extends BaseTable {
  @Column({ unique: true })
  @Index()
  serial_number: string;

  @ManyToOne(() => product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: product;

  @Column()
  @Index()
  product_id: string;

  @ManyToOne(() => product_batch, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "batch_id" })
  batch: product_batch;

  @Column({ nullable: true })
  batch_id: string;

  @Column({ type: "enum", enum: SerialStatus, default: SerialStatus.IN_STOCK })
  serial_status: SerialStatus;

  @ManyToOne(() => invoice, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "invoice_id" })
  invoice: invoice;

  @Column({ nullable: true })
  invoice_id: string;

  @Column()
  @Index()
  store_id: string;
}
