import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "../Admin/company";
import { AuditLogIdentity } from "@Helper/AuditLog.decorators";

@Entity()
export class product_category extends BaseTable {
  @AuditLogIdentity()
  @Column()
  name: string;

  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column()
  @Index()
  store_id: string;
}
