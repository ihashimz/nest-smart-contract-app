import { resolve } from 'path';
import { CommandUtils } from 'typeorm/commands/CommandUtils';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';

describe('database configuration', () => {
  it('never synchronizes schema automatically', () => {
    const config = new DatabaseConfig({
      get: (key) => (key === 'NODE_ENV' ? 'development' : undefined),
    } as ConfigService);
    expect(config.createTypeOrmOptions().synchronize).toBe(false);
  });
  it('verifies production database TLS certificates', () => {
    const config = new DatabaseConfig({
      get: (key) => (key === 'NODE_ENV' ? 'production' : undefined),
    } as ConfigService);
    expect((config.createTypeOrmOptions() as any).ssl).not.toEqual({
      rejectUnauthorized: false,
    });
  });
  it('exports a CLI-loadable datasource with an initial schema migration', async () => {
    const source = await CommandUtils.loadDataSource(
      resolve(__dirname, 'database/data-source.ts'),
    );
    expect(source).toBeInstanceOf(DataSource);
    await (source as any).buildMetadatas();
    expect(source.entityMetadatas).toHaveLength(5);
    expect(source.migrations).toHaveLength(1);
    const statements: string[] = [];
    await source.migrations[0].up({
      query: async (sql) => statements.push(sql),
    } as any);
    for (const table of [
      'banks',
      'users',
      'options',
      'option_transfers',
      'audit_logs',
    ]) {
      expect(
        statements.some((sql) => sql.includes('CREATE TABLE "' + table + '"')),
      ).toBe(true);
    }
    expect(statements.some((sql) => sql.includes('FOREIGN KEY'))).toBe(true);
  });
});
