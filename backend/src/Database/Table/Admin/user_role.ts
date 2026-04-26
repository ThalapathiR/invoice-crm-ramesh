import { BaseTable } from '../BaseTable';
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { AuditLogIdentity } from '@Helper/AuditLog.decorators';
import { company } from './company';

@Entity()
export class user_role extends BaseTable {

  @AuditLogIdentity()
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  landing_page: string;

  @Column({ type: "boolean", default: false })
  is_team_role: boolean;

  @Column({ type: "json", nullable: true })
  permission: any;

  @ManyToOne(() => company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "store_id" })
  store: company;

  @Column({ type: "uuid", nullable: true })
  @Index()
  store_id: string;
}
