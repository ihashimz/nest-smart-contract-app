import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';

// The CLI loads this instance without starting the Nest HTTP application.
export default new DataSource(
  new DatabaseConfig(
    new ConfigService(),
  ).createTypeOrmOptions() as DataSourceOptions,
);
