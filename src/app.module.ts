import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { OptionsModule } from './options/options.module';
import { BanksModule } from './banks/banks.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AuditModule } from './audit/audit.module';

import { DatabaseConfig } from './config/database.config';
import { AppConfig } from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
        limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100'),
      },
    ]),

    // Feature modules
    AuthModule,
    OptionsModule,
    BanksModule,
    BlockchainModule,
    AuditModule,
  ],
})
export class AppModule {} 