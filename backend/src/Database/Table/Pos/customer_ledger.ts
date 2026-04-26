import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { customer } from "./customer";
import { invoice } from "./invoice";

export enum LedgerType {
  SALE = "SALE",
  PAYMENT = "PAYMENT",
  RETURN = "RETURN",
  ADJUSTMENT = "ADJUSTMENT"
}

@Entity()
export class customer_ledger extends BaseTable {
  @ManyToOne(() => customer, { onDelete: "CASCADE" })
  @JoinColumn({ name: "customer_id" })
  customer: customer;

  @Column()
  @Index()
  customer_id: string;

  @ManyToOne(() => invoice, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "invoice_id" })
  invoice: invoice;

  @Column({ nullable: true })
  @Index()
  invoice_id: string;

  @Column({ type: "enum", enum: LedgerType })
  type: LedgerType;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  debit: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  credit: number;

  @Column({ type: "decimal", precision: 12, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  balance: number;

  @Column({ type: "text", nullable: true })
  notes: string;
}
