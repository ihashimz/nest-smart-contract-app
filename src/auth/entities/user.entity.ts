import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Bank } from '../../banks/entities/bank.entity';
import { UserRole } from '../../common/decorators/roles.decorator';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['bankId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, array: true, default: [UserRole.TRADER] })
  roles: UserRole[];

  @Column({ type: 'uuid' })
  bankId: string;

  @ManyToOne(() => Bank, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bankId' })
  bank: Bank;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 