import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Option } from '../../options/entities/option.entity';

@Entity('banks')
@Index(['name'], { unique: true })
@Index(['blockchainAddress'], { unique: true })
export class Bank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string; // Bank identifier code

  @Column()
  blockchainAddress: string; // Ethereum/Polygon address

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Option, (option) => option.currentOwner)
  options: Option[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 