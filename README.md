# NestJS options practice API

A backend practice project exploring NestJS modules, JWT authorization, tenant-scoped PostgreSQL data, Swagger, and an experimental ERC-721 client. It is not a production banking system. Blockchain writes are disabled by default.

Implemented: authenticated administrator provisioning, bank-scoped option reads and creation, bank-scoped administration, active-bank checks, bcrypt password hashing, strict DTO whitelisting, Helmet, global request throttling, a standalone TypeORM DataSource, an initial schema migration, and regression tests. Audit storage/query helpers exist; automatic audit event capture is not implemented.

## Setup

Requires Node.js 22 and PostgreSQL 14 or newer. No Docker setup is included.

```sh
npm ci
cp env.example .env
```

Set `DATABASE_URL` for an empty local database and generate a strong `JWT_SECRET`, for example with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Set the five `SEED_*` inputs in `.env` using your own test credentials. The seed password must have at least 12 characters. Never use a real bank wallet/private key for this practice application.

```sh
npm run migration:run
npm run seed:admin
npm run start:dev
```

The seed command creates the bank and its initial `BANK_ADMIN` in one transaction. Rerunning matching inputs preserves an existing administrator's password. It refuses to elevate an existing trader or silently change a bank's identity. Additional banks/admins are provisioned through the explicit seed command; there is no public bank or administrator signup route. Remove bootstrap passwords from `.env` after use.

Swagger is available at `http://localhost:3000/api/docs`. The API prefix is `/api`.

## Authorization and endpoints

Log in with the seeded administrator at `POST /api/auth/login` and use the returned JWT as a bearer token.

| Route | Access and behavior |
| --- | --- |
| `POST /api/auth/login` | Authenticate an active user in an active bank |
| `POST /api/auth/register` | `BANK_ADMIN` provisions a trader in the administrator's own bank |
| `POST /api/auth/profile` | Authenticated user's profile |
| `GET /api/banks` | Authenticated user's active bank only |
| `GET /api/banks/:id` | Own bank only |
| `GET /api/banks/address/:address` | Own bank only |
| `PATCH /api/banks/:id` | Administrator updates own bank |
| `DELETE /api/banks/:id` | Administrator deactivates own bank |
| `POST /api/options` | Trader/administrator creates an option owned by their bank |
| `GET /api/options` | Options owned by authenticated bank |
| `GET /api/options/:id` | Option currently owned by authenticated bank |
| `GET /api/options/:id/history` | History for an option currently owned by authenticated bank |
| `POST /api/options/:id/transfer` | Experimental; disabled unless explicitly enabled |

Registration accepts `email`, `password`, `firstName`, and `lastName`. It rejects supplied `bankId` or `roles`. Option creation accepts its financial/token fields and optional metadata; it rejects `currentOwnerId`. Ownership comes from the authenticated user's bank. A caller-supplied `bankId` query parameter cannot broaden option reads. Deactivated banks' users cannot obtain or use JWT sessions.

Throttling defaults to 100 requests per 60 seconds per client; `RATE_LIMIT_TTL` is configured in seconds. Production CORS currently has a placeholder frontend origin in `src/main.ts`; configure it for your own deployment. Production database TLS verifies server certificates and requires a trusted certificate chain.

## Database and tests

Schema synchronization is disabled in every environment. The initial migration includes tables, enums, indexes, and foreign keys. It targets an empty database; do not apply it blindly over a schema previously created by `synchronize`.

```sh
npm run build
npm test -- --runInBand
npm run test:cov -- --runInBand --watchman=false
npm run migration:show
npm run migration:generate -- src/migrations/DescribeChange
npm run migration:revert
```

Regression tests cover real HTTP JWT/role authorization with a repository fake, DTO/service tenant boundaries, inactive-bank sessions, explicit administrator bootstrap, the CLI DataSource/schema statements, and disabled blockchain writes. They do not exercise a live Ethereum network. The CI workflow runs the build and tests, plus migration run/revert/run and bootstrap against disposable PostgreSQL 16. No local database is required for the regression suite; HTTP tests bind a temporary loopback port.

## Experimental blockchain boundary

`ENABLE_EXPERIMENTAL_TRANSFERS=false` is the default. Only setting it to the exact value `true` permits the adapter to submit blockchain transactions; RPC, private key, and contract settings are then required. Enabling this flag does not make the prototype safe for real assets.

The inline ABI contains ERC-721 transfer/owner methods. This repository does not include custom Solidity contracts, deployment artifacts, minting, or validated bank-to-bank custody. The adapter currently assumes the server wallet is the NFT owner. A bank-owned token requires an explicitly designed owner/signing/approval model. The current option status transition also prevents onward transfers.

SQL updates and blockchain confirmation are separate operations. There is no concurrency reservation, idempotency key, durable submission/reconciliation worker, or recovery from a chain-success/database-failure case. Use only disposable test assets if exploring the opt-in adapter. The API's numeric financial DTOs and unbounded lists also need domain/precision and pagination work before serious use.

No health endpoint, Dockerfile, live demonstration, queue, cache, automatic compliance audit, or production-readiness claim is included.
