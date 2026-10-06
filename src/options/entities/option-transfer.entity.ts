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
import { Option } from './option.entity';
import { Bank } from '../../banks/entities/bank.entity';

export enum TransferStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

@Entity('option_transfers')
@Index(['optionId'])
@Index(['fromBankId'])
@Index(['toBankId'])
@Index(['status'])
@Index(['transactionHash'])
export class OptionTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  optionId: string;

  @ManyToOne(() => Option, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'optionId' })
  option: Option;

  @Column({ type: 'uuid' })
  fromBankId: string;

  @ManyToOne(() => Bank, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromBankId' })
  fromBank: Bank;

  @Column({ type: 'uuid' })
  toBankId: string;

  @ManyToOne(() => Bank, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toBankId' })
  toBank: Bank;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column({ nullable: true })
  transactionHash: string; // Blockchain transaction hash

  @Column({ nullable: true })
  blockNumber: number; // Blockchain block number

  @Column({ type: 'bigint', nullable: true })
  gasUsed: string; // Gas used for the transaction

  @Column({ nullable: true })
  gasPrice: string; // Gas price in wei

  @Column({ type: 'text', nullable: true })
  failureReason: string; // Reason for failure if status is FAILED

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
