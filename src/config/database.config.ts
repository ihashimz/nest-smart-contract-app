import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get<string>('DATABASE_URL'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: false,
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? { rejectUnauthorized: true }
          : false,
      uuidExtension: 'pgcrypto',
      installExtensions: false,
      autoLoadEntities: true,
    };
  }
}
