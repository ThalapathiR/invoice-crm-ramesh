import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "../Admin/company";
import { customer } from "./customer";
import { invoice_item } from "./invoice_item";
import { AuditLogIdentity } from "@Helper/AuditLog.decorators";

@Entity()
export class invoice extends BaseTable {
  @AuditLogIdentity()
  @Column({ unique: true })
  @Index()
  invoice_number: string;

  @ManyToOne(() => customer, { onDelete: "RESTRICT", nullable: true })
  @JoinColumn({ name: "customer_id" })
  customer: customer;

  @Column({ nullable: true })
  @Index()
  customer_id: string;

  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column()
  @Index()
  store_id: string;

  @Column({ type: "decimal", precision: 12, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  subtotal: number;

  @Column({ type: "decimal", precision: 12, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  tax_amount: number;

  @Column({ type: "decimal", precision: 12, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  total_amount: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  discount_percentage: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  discount_amount: number;

  @Column()
  payment_method: string;

  @Column({ nullable: true })
  bank_account_id: string;

  @Column({ nullable: true })
  upi_reference: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  paid_amount: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  due_amount: number;

  @OneToMany(() => invoice_item, (item) => item.invoice, { cascade: true })
  items: invoice_item[];
}
