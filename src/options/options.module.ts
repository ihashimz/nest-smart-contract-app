import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';
import { Option } from './entities/option.entity';
import { OptionTransfer } from './entities/option-transfer.entity';
import { BanksModule } from '../banks/banks.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Option, OptionTransfer]),
    BanksModule,
    BlockchainModule,
  ],
  controllers: [OptionsController],
  providers: [OptionsService],
  exports: [OptionsService],
})
export class OptionsModule {} 