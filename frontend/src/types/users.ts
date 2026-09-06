import type { Role } from './enums';
import type { PagedQuery } from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  role: Role;
  password: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  role: Role;
  newPassword?: string | null;
}

export interface GetUsersQuery extends PagedQuery {
  searchTerm?: string;
  role?: Role;
  includeInactive?: boolean;
}
