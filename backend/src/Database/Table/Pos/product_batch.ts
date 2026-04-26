import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { product } from "./product";
import { company } from "../Admin/company";

@Entity()
export class product_batch extends BaseTable {
  @ManyToOne(() => product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: product;

  @Column()
  @Index()
  product_id: string;

  @Column()
  batch_number: string;

  @Column({ type: "timestamp" })
  purchase_date: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  cost_price: number;

  @Column({ type: "int" })
  initial_quantity: number;

  @Column({ type: "int" })
  current_quantity: number;

  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column()
  @Index()
  store_id: string;
}
