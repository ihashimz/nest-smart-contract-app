import { DataSource } from 'typeorm';
import { isEmail } from 'class-validator';
import { ethers } from 'ethers';
import * as bcrypt from 'bcrypt';
import { Bank } from '../banks/entities/bank.entity';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../common/decorators/roles.decorator';
import dataSource from './data-source';

export async function seedAdmin(
  source: DataSource,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const required = [
    'SEED_ADMIN_EMAIL',
    'SEED_ADMIN_PASSWORD',
    'SEED_BANK_NAME',
    'SEED_BANK_CODE',
    'SEED_BANK_ADDRESS',
  ];
  for (const key of required) {
    if (!env[key]?.trim()) throw new Error(`${key} is required`);
  }
  if (!isEmail(env.SEED_ADMIN_EMAIL))
    throw new Error('SEED_ADMIN_EMAIL must be a valid email');
  if (env.SEED_ADMIN_PASSWORD.length < 12)
    throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters');
  if (!ethers.isAddress(env.SEED_BANK_ADDRESS))
    throw new Error('SEED_BANK_ADDRESS must be a valid Ethereum address');

  await source.transaction(async (manager) => {
    let bank = await manager.findOneBy(Bank, { name: env.SEED_BANK_NAME });
    if (
      bank &&
      (!bank.isActive ||
        bank.code !== env.SEED_BANK_CODE ||
        bank.blockchainAddress !== env.SEED_BANK_ADDRESS)
    ) {
      throw new Error('Existing bank does not match bootstrap configuration');
    }
    const existingUser = await manager.findOneBy(User, {
      email: env.SEED_ADMIN_EMAIL,
    });
    if (existingUser) {
      if (
        bank &&
        existingUser.bankId === bank.id &&
        existingUser.roles.includes(UserRole.BANK_ADMIN)
      )
        return;
      throw new Error('A different user already exists with this email');
    }
    if (!bank) {
      bank = await manager.save(
        Bank,
        manager.create(Bank, {
          name: env.SEED_BANK_NAME,
          code: env.SEED_BANK_CODE,
          blockchainAddress: env.SEED_BANK_ADDRESS,
        }),
      );
    }
    await manager.save(
      User,
      manager.create(User, {
        email: env.SEED_ADMIN_EMAIL,
        password: await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12),
        firstName: 'Bank',
        lastName: 'Administrator',
        bankId: bank.id,
        roles: [UserRole.BANK_ADMIN],
      }),
    );
  });
}

if (require.main === module) {
  (async () => {
    await dataSource.initialize();
    try {
      await seedAdmin(dataSource);
      console.log(
        'Administrator bootstrap complete; existing credentials were not changed.',
      );
    } finally {
      await dataSource.destroy();
    }
  })().catch(() => {
    console.error(
      'Administrator bootstrap failed. Check required seed inputs, migrations, and database connectivity.',
    );
    process.exitCode = 1;
  });
}
