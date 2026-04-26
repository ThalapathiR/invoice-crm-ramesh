import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "../Admin/company";

@Entity()
export class payment_method extends BaseTable {
  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column()
  @Index()
  store_id: string;

  @Column()
  method_name: string;

  @Column({ default: true })
  is_active: boolean;
}
