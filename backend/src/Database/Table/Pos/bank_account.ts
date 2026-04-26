import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "../Admin/company";

@Entity()
export class bank_account extends BaseTable {
  @Column()
  bank_name: string;

  @Column()
  account_number: string;

  @Column({ nullable: true })
  ifsc_code: string;

  @Column({ nullable: true })
  upi_id: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0, transformer: { to: (v) => v, from: (v) => parseFloat(v) } })
  current_balance: number;

  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column()
  @Index()
  store_id: string;
}
