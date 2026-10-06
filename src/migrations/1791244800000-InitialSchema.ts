import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1791244800000 implements MigrationInterface {
  name = 'InitialSchema1791244800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "banks" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "code" character varying NOT NULL, "blockchainAddress" character varying NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_49e37807b753e002669ef111c9" ON "banks" ("blockchainAddress") ',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_bc680de8ba9d7878fddcecd610" ON "banks" ("name") ',
    );
    await queryRunner.query(
      "CREATE TYPE \"option_transfers_status_enum\" AS ENUM('PENDING', 'CONFIRMED', 'FAILED')",
    );
    await queryRunner.query(
      'CREATE TABLE "option_transfers" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "optionId" uuid NOT NULL, "fromBankId" uuid NOT NULL, "toBankId" uuid NOT NULL, "status" "option_transfers_status_enum" NOT NULL DEFAULT \'PENDING\', "transactionHash" character varying, "blockNumber" integer, "gasUsed" bigint, "gasPrice" character varying, "failureReason" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ff41af5f0ce96fa05b444bf9f29" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_11e712b4e25844f01ca699fff9" ON "option_transfers" ("transactionHash") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_39a186abf2b34cef4516638146" ON "option_transfers" ("status") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_419e5b7d407231d3c4882d0d05" ON "option_transfers" ("toBankId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_1fba2c368d03d5d2f4c6448792" ON "option_transfers" ("fromBankId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_ccfe0e9b9eec79508944fdd543" ON "option_transfers" ("optionId") ',
    );
    await queryRunner.query(
      "CREATE TYPE \"options_optiontype_enum\" AS ENUM('CALL', 'PUT')",
    );
    await queryRunner.query(
      "CREATE TYPE \"options_status_enum\" AS ENUM('ACTIVE', 'TRANSFERRED', 'EXPIRED')",
    );
    await queryRunner.query(
      'CREATE TABLE "options" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "symbol" character varying NOT NULL, "strikePrice" numeric(18,8) NOT NULL, "expirationDate" TIMESTAMP NOT NULL, "optionType" "options_optiontype_enum" NOT NULL, "premium" numeric(18,8) NOT NULL, "quantity" numeric(18,8) NOT NULL, "underlyingAsset" character varying NOT NULL, "blockchainAddress" character varying NOT NULL, "tokenId" character varying NOT NULL, "status" "options_status_enum" NOT NULL DEFAULT \'ACTIVE\', "currentOwnerId" uuid NOT NULL, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d232045bdb5c14d932fba18d957" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_722ed6c2801ec03deaf50247d5" ON "options" ("status") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_40c31313e65c6877658ec83231" ON "options" ("currentOwnerId") ',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_193075c25841b95df81ba8b3cb" ON "options" ("blockchainAddress", "tokenId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cc03f4662ce07ddc82c1751ab1" ON "options" ("symbol") ',
    );
    await queryRunner.query(
      "CREATE TYPE \"users_roles_enum\" AS ENUM('BANK_ADMIN', 'TRADER', 'COMPLIANCE')",
    );
    await queryRunner.query(
      'CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "roles" "users_roles_enum" array NOT NULL DEFAULT \'{TRADER}\', "bankId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_76a4450ed7980762ba457b98f7" ON "users" ("bankId") ',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") ',
    );
    await queryRunner.query(
      "CREATE TYPE \"audit_logs_action_enum\" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'TRANSFER', 'LOGIN', 'LOGOUT', 'BLOCKCHAIN_TRANSACTION')",
    );
    await queryRunner.query(
      "CREATE TYPE \"audit_logs_resource_enum\" AS ENUM('USER', 'BANK', 'OPTION', 'TRANSFER', 'AUTH')",
    );
    await queryRunner.query(
      'CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" uuid, "userEmail" character varying, "bankId" uuid, "bankName" character varying, "action" "audit_logs_action_enum" NOT NULL, "resource" "audit_logs_resource_enum" NOT NULL, "resourceId" uuid, "description" text, "oldValues" jsonb, "newValues" jsonb, "ipAddress" character varying, "userAgent" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_c69efb19bf127c97e6740ad530" ON "audit_logs" ("createdAt") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_8769d5d852a6b56dd77186a1c6" ON "audit_logs" ("resource") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_d9e0c0a6d7f9e4b428fc4361b2" ON "audit_logs" ("bankId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cfa83f61e4d27a87fcae1e025a" ON "audit_logs" ("userId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "option_transfers" ADD CONSTRAINT "FK_ccfe0e9b9eec79508944fdd543a" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "option_transfers" ADD CONSTRAINT "FK_1fba2c368d03d5d2f4c64487921" FOREIGN KEY ("fromBankId") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "option_transfers" ADD CONSTRAINT "FK_419e5b7d407231d3c4882d0d051" FOREIGN KEY ("toBankId") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "options" ADD CONSTRAINT "FK_40c31313e65c6877658ec83231b" FOREIGN KEY ("currentOwnerId") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "users" ADD CONSTRAINT "FK_76a4450ed7980762ba457b98f77" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" DROP CONSTRAINT "FK_76a4450ed7980762ba457b98f77"',
    );
    await queryRunner.query(
      'ALTER TABLE "options" DROP CONSTRAINT "FK_40c31313e65c6877658ec83231b"',
    );
    await queryRunner.query(
      'ALTER TABLE "option_transfers" DROP CONSTRAINT "FK_419e5b7d407231d3c4882d0d051"',
    );
    await queryRunner.query(
      'ALTER TABLE "option_transfers" DROP CONSTRAINT "FK_1fba2c368d03d5d2f4c64487921"',
    );
    await queryRunner.query(
      'ALTER TABLE "option_transfers" DROP CONSTRAINT "FK_ccfe0e9b9eec79508944fdd543a"',
    );
    await queryRunner.query('DROP INDEX "IDX_cfa83f61e4d27a87fcae1e025a"');
    await queryRunner.query('DROP INDEX "IDX_d9e0c0a6d7f9e4b428fc4361b2"');
    await queryRunner.query('DROP INDEX "IDX_cee5459245f652b75eb2759b4c"');
    await queryRunner.query('DROP INDEX "IDX_8769d5d852a6b56dd77186a1c6"');
    await queryRunner.query('DROP INDEX "IDX_c69efb19bf127c97e6740ad530"');
    await queryRunner.query('DROP TABLE "audit_logs"');
    await queryRunner.query('DROP TYPE "audit_logs_resource_enum"');
    await queryRunner.query('DROP TYPE "audit_logs_action_enum"');
    await queryRunner.query('DROP INDEX "IDX_97672ac88f789774dd47f7c8be"');
    await queryRunner.query('DROP INDEX "IDX_76a4450ed7980762ba457b98f7"');
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TYPE "users_roles_enum"');
    await queryRunner.query('DROP INDEX "IDX_cc03f4662ce07ddc82c1751ab1"');
    await queryRunner.query('DROP INDEX "IDX_193075c25841b95df81ba8b3cb"');
    await queryRunner.query('DROP INDEX "IDX_40c31313e65c6877658ec83231"');
    await queryRunner.query('DROP INDEX "IDX_722ed6c2801ec03deaf50247d5"');
    await queryRunner.query('DROP TABLE "options"');
    await queryRunner.query('DROP TYPE "options_status_enum"');
    await queryRunner.query('DROP TYPE "options_optiontype_enum"');
    await queryRunner.query('DROP INDEX "IDX_ccfe0e9b9eec79508944fdd543"');
    await queryRunner.query('DROP INDEX "IDX_1fba2c368d03d5d2f4c6448792"');
    await queryRunner.query('DROP INDEX "IDX_419e5b7d407231d3c4882d0d05"');
    await queryRunner.query('DROP INDEX "IDX_39a186abf2b34cef4516638146"');
    await queryRunner.query('DROP INDEX "IDX_11e712b4e25844f01ca699fff9"');
    await queryRunner.query('DROP TABLE "option_transfers"');
    await queryRunner.query('DROP TYPE "option_transfers_status_enum"');
    await queryRunner.query('DROP INDEX "IDX_bc680de8ba9d7878fddcecd610"');
    await queryRunner.query('DROP INDEX "IDX_49e37807b753e002669ef111c9"');
    await queryRunner.query('DROP TABLE "banks"');
  }
}
