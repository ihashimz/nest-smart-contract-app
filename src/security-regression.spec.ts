import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { BlockchainService } from './blockchain/blockchain.service';
import { User } from './auth/entities/user.entity';
import { UserRole } from './common/decorators/roles.decorator';
import { BanksService } from './banks/banks.service';
import { OptionsService } from './options/options.service';
import { RegisterDto } from './auth/dto/login.dto';
import { CreateOptionDto } from './options/dto/create-option.dto';

const bankId = '11111111-1111-4111-8111-111111111111';
const otherBankId = '22222222-2222-4222-8222-222222222222';
const actor = { id: 'admin', bankId, roles: [UserRole.BANK_ADMIN] };
const registration = {
  email: 'trader@example.test',
  password: 'strong-test-password',
  firstName: 'Test',
  lastName: 'Trader',
};
const option = {
  symbol: 'TEST',
  strikePrice: 10,
  expirationDate: '2030-01-01',
  optionType: 'CALL',
  premium: 1,
  quantity: 1,
  underlyingAsset: 'TEST',
  blockchainAddress: '0x1111111111111111111111111111111111111111',
  tokenId: '1',
};

// HTTP tests use real Passport/JWT/role guards and a repository boundary fake.
describe('bank-user provisioning HTTP authorization', () => {
  let app;
  let jwt: JwtService;
  const auth = {
    register: jest.fn().mockResolvedValue({ accessToken: 'test' }),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret: 'test-only-secret' }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: auth },
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: () => 'test-only-secret',
            getOrThrow: () => 'test-only-secret',
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: async ({ where }) => ({
              id: where.id,
              bankId,
              roles:
                where.id === 'admin'
                  ? [UserRole.BANK_ADMIN]
                  : [UserRole.TRADER],
              bank: { isActive: true },
            }),
          },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.listen(0, '127.0.0.1');
    jwt = module.get(JwtService);
  });
  afterAll(async () => app.close());
  beforeEach(() => auth.register.mockClear());
  it('rejects anonymous bank-user registration', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...registration, bankId })
      .expect(401);
    expect(auth.register).not.toHaveBeenCalled();
  });
  it('rejects trader provisioning', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .auth(jwt.sign({ sub: 'trader' }), { type: 'bearer' })
      .send({ ...registration, bankId })
      .expect(403);
  });
  it('passes authenticated bank context to provisioning', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .auth(jwt.sign({ sub: 'admin' }), { type: 'bearer' })
      .send(registration)
      .expect(201);
    expect(auth.register).toHaveBeenCalledWith(
      registration,
      expect.objectContaining(actor),
    );
  });
});

describe('service and DTO tenant boundaries', () => {
  it('rejects caller-supplied bank membership', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    await expect(
      pipe.transform(
        { ...registration, bankId: otherBankId },
        { type: 'body', metatype: RegisterDto },
      ),
    ).rejects.toThrow();
  });
  it('rejects caller-supplied option ownership', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    await expect(
      pipe.transform(
        { ...option, currentOwnerId: otherBankId },
        { type: 'body', metatype: CreateOptionDto },
      ),
    ).rejects.toThrow();
  });
  it('rejects role injection', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    await expect(
      pipe.transform(
        { ...registration, roles: [UserRole.BANK_ADMIN] },
        { type: 'body', metatype: RegisterDto },
      ),
    ).rejects.toThrow();
  });
  it('rejects provisioning without an administrator at the service boundary', async () => {
    const service = new AuthService(
      {
        findOne: async () => null,
        create: (value) => value,
        save: async (value) => ({
          ...value,
          id: 'trader',
          roles: [UserRole.TRADER],
        }),
      } as any,
      { sign: () => 'test' } as any,
      { findOne: async () => ({}) } as any,
    );
    await expect(
      (service.register as any)(registration, {
        ...actor,
        roles: [UserRole.TRADER],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('ignores forged bankId when persisting a provisioned trader', async () => {
    let saved;
    const repository = {
      findOne: async () => null,
      create: (value) => value,
      save: async (value) =>
        (saved = { ...value, id: 'trader', roles: [UserRole.TRADER] }),
    };
    const service = new AuthService(
      repository as any,
      { sign: () => 'test' } as any,
      { findOne: async () => ({}) } as any,
    );
    await (service.register as any)(
      { ...registration, bankId: otherBankId },
      actor,
    );
    expect(saved.bankId).toBe(bankId);
    expect(saved.roles).toEqual([UserRole.TRADER]);
  });
  it('rejects JWT users whose bank was deactivated', async () => {
    const strategy = new JwtStrategy(
      {
        get: () => 'test-only-secret',
        getOrThrow: () => 'test-only-secret',
      } as any,
      { findOne: async () => ({ ...actor, bank: { isActive: false } }) } as any,
    );
    await expect(strategy.validate({ sub: 'admin' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('scopes bank lists to the authenticated bank', async () => {
    let options;
    const service = new BanksService({
      find: async (value) => ((options = value), []),
    } as any);
    await (service.findAll as any)(bankId);
    expect(options.where).toEqual({ id: bankId, isActive: true });
  });
  it.each(['update', 'remove', 'findOne'])(
    'rejects %s for another bank',
    async (method) => {
      const repo = {
        findOne: async () => ({ id: otherBankId, isActive: true }),
        save: async (value) => value,
      };
      const service = new BanksService(repo as any);
      const args =
        method === 'update' ? [otherBankId, {}, bankId] : [otherBankId, bankId];
      await expect((service[method] as any)(...args)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    },
  );
  it('derives option owner from authenticated context', async () => {
    let saved;
    const repo = {
      findOne: async () => null,
      create: (value) => value,
      save: async (value) => (saved = value),
    };
    const service = new OptionsService(
      repo as any,
      {} as any,
      { findOne: async () => ({}) } as any,
      {} as any,
      {} as any,
    );
    await (service.create as any)(
      { ...option, currentOwnerId: otherBankId },
      bankId,
    );
    expect(saved.currentOwnerId).toBe(bankId);
  });
  it('scopes an individual option lookup to its bank', async () => {
    let options;
    const service = new OptionsService(
      { findOne: async (value) => ((options = value), null) } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    await expect(
      (service.findOne as any)('option', bankId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(options.where).toEqual({ id: 'option', currentOwnerId: bankId });
  });
  it('authorizes ownership before exposing transfer history', async () => {
    const transfers = { find: jest.fn().mockResolvedValue([]) };
    const service = new OptionsService(
      { findOne: async () => null } as any,
      transfers as any,
      {} as any,
      {} as any,
      {} as any,
    );
    await expect(
      (service.getTransferHistory as any)('option', bankId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transfers.find).not.toHaveBeenCalled();
  });
});

it('disables real blockchain writes unless explicitly enabled', async () => {
  const service = new BlockchainService({ get: () => undefined } as any);
  await expect(
    service.transferOption(
      option.blockchainAddress,
      '1',
      option.blockchainAddress,
    ),
  ).rejects.toThrow('disabled');
});
