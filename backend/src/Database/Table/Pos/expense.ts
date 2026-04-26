import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "../Admin/company";
import { expense_category } from "../Admin/expense_category";
import { bank_account } from "./bank_account";

@Entity()
export class expense extends BaseTable {
  @Column({ type: "decimal", precision: 12, scale: 2, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  amount: number;

  @ManyToOne(() => expense_category, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "category_id" })
  category: expense_category;

  @Column()
  category_id: string;

  @ManyToOne(() => bank_account, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "bank_account_id" })
  bank_account: bank_account;

  @Column({ nullable: true })
  bank_account_id: string;

  @Column({ type: "timestamp" })
  expense_date: Date;

  @Column({ type: "text", nullable: true })
  notes: string;

  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column()
  @Index()
  store_id: string;
}
