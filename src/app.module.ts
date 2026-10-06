import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { OptionsModule } from './options/options.module';
import { BanksModule } from './banks/banks.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AuditModule } from './audit/audit.module';

import { DatabaseConfig } from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: seconds(parseInt(process.env.RATE_LIMIT_TTL || '60', 10)),
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
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
