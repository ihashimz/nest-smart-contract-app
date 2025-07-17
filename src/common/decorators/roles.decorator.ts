import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  BANK_ADMIN = 'BANK_ADMIN',
  TRADER = 'TRADER',
  COMPLIANCE = 'COMPLIANCE',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles); 