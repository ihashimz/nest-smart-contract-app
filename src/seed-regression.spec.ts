import { resolve } from 'path';
import { Bank } from './banks/entities/bank.entity';
import { User } from './auth/entities/user.entity';
import { UserRole } from './common/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';

const env = {
  SEED_ADMIN_EMAIL: 'admin@example.test',
  SEED_ADMIN_PASSWORD: 'test-seed-password',
  SEED_BANK_NAME: 'Test Bank',
  SEED_BANK_CODE: 'TEST',
  SEED_BANK_ADDRESS: '0x1111111111111111111111111111111111111111',
};
const run = async (source, settings = env) => {
  const { seedAdmin } = require(resolve(__dirname, 'database/seed-admin.ts'));
  return seedAdmin(source, settings);
};

describe('explicit administrator bootstrap', () => {
  it('rejects missing bootstrap inputs before touching the database', async () => {
    const source = { transaction: jest.fn() };
    await expect(run(source, {} as any)).rejects.toThrow('SEED_ADMIN_EMAIL');
    expect(source.transaction).not.toHaveBeenCalled();
  });
  it('creates a bank administrator with a hashed password in one transaction', async () => {
    const saved = [];
    const manager = {
      findOneBy: async () => null,
      create: (_type, value) => value,
      save: async (_type, value) => {
        const record = { ...value, id: saved.length ? 'admin' : 'bank' };
        saved.push(record);
        return record;
      },
    };
    await run({ transaction: async (fn) => fn(manager) });
    expect(saved).toHaveLength(2);
    expect(saved[1].bankId).toBe('bank');
    expect(saved[1].roles).toEqual([UserRole.BANK_ADMIN]);
    expect(saved[1].password).not.toBe(env.SEED_ADMIN_PASSWORD);
    expect(
      await bcrypt.compare(env.SEED_ADMIN_PASSWORD, saved[1].password),
    ).toBe(true);
  });
  it('does not reset an existing administrator password', async () => {
    const bank = {
      id: 'bank',
      name: env.SEED_BANK_NAME,
      code: env.SEED_BANK_CODE,
      blockchainAddress: env.SEED_BANK_ADDRESS,
      isActive: true,
    };
    const admin = { bankId: 'bank', roles: [UserRole.BANK_ADMIN] };
    const manager = {
      findOneBy: async (type) => (type === Bank ? bank : admin),
      save: jest.fn(),
    };
    await run({ transaction: async (fn) => fn(manager) });
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('never elevates an existing trader during bootstrap', async () => {
    const bank = {
      id: 'bank',
      name: env.SEED_BANK_NAME,
      code: env.SEED_BANK_CODE,
      blockchainAddress: env.SEED_BANK_ADDRESS,
      isActive: true,
    };
    const manager = {
      findOneBy: async (type) =>
        type === User ? { bankId: 'bank', roles: [UserRole.TRADER] } : bank,
      save: jest.fn(),
    };
    await expect(
      run({ transaction: async (fn) => fn(manager) }),
    ).rejects.toThrow('already exists');
    expect(manager.save).not.toHaveBeenCalled();
  });
});
