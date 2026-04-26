import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "../Admin/company";
import { AuditLogIdentity } from "@Helper/AuditLog.decorators";

@Entity()
export class customer extends BaseTable {
  @AuditLogIdentity()
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  total_purchases: number;

  @Column({ default: 0 })
  total_invoices: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  current_balance: number;

  @Column({ type: "timestamp", nullable: true })
  last_visit: Date;

  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column()
  @Index()
  store_id: string;
}
