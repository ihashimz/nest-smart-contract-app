import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  TRANSFER = 'TRANSFER',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  BLOCKCHAIN_TRANSACTION = 'BLOCKCHAIN_TRANSACTION',
}

export enum AuditResource {
  USER = 'USER',
  BANK = 'BANK',
  OPTION = 'OPTION',
  TRANSFER = 'TRANSFER',
  AUTH = 'AUTH',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['bankId'])
@Index(['action'])
@Index(['resource'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ type: 'uuid', nullable: true })
  bankId: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditResource })
  resource: AuditResource;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
} 