import { UserRole } from '../common/decorators/roles.decorator';

export interface AuthenticatedUser {
  id: string;
  bankId: string;
  roles: UserRole[];
}
