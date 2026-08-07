import type { Role } from '@/types';

export const ROLES = {
  ITADMIN: 'ItAdmin' as Role,
  EMPLOYEE: 'Employee' as Role,
};

export function hasRole(userRole: Role | undefined, allowed: Role[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

export function isItAdmin(userRole: Role | undefined): boolean {
  return userRole === ROLES.ITADMIN;
}
