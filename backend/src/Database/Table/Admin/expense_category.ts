import { Column, Entity } from "typeorm";
import { BaseTable } from "../BaseTable";

@Entity()
export class expense_category extends BaseTable {
  @Column({ unique: true })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;
}
