import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Bank } from '../../banks/entities/bank.entity';
import { OptionTransfer } from './option-transfer.entity';

export enum OptionType {
  CALL = 'CALL',
  PUT = 'PUT',
}

export enum OptionStatus {
  ACTIVE = 'ACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  EXPIRED = 'EXPIRED',
}

@Entity('options')
@Index(['symbol'])
@Index(['blockchainAddress', 'tokenId'], { unique: true })
@Index(['currentOwnerId'])
@Index(['status'])
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  symbol: string; // e.g., "AAPL-CALL-150-2024-12-15"

  @Column('decimal', { precision: 18, scale: 8 })
  strikePrice: number;

  @Column()
  expirationDate: Date;

  @Column({ type: 'enum', enum: OptionType })
  optionType: OptionType;

  @Column('decimal', { precision: 18, scale: 8 })
  premium: number;

  @Column('decimal', { precision: 18, scale: 8 })
  quantity: number;

  @Column()
  underlyingAsset: string; // e.g., "AAPL"

  @Column()
  blockchainAddress: string; // Smart contract address

  @Column()
  tokenId: string; // NFT token ID

  @Column({ type: 'enum', enum: OptionStatus, default: OptionStatus.ACTIVE })
  status: OptionStatus;

  @Column({ type: 'uuid' })
  currentOwnerId: string;

  @ManyToOne(() => Bank, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'currentOwnerId' })
  currentOwner: Bank;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => OptionTransfer, (transfer) => transfer.option)
  transfers: OptionTransfer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 