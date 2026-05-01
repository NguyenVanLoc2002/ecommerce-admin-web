import type { EntityId, PaginationParams } from '@/shared/types/api.types';

export const AdminUserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
} as const;

export type AdminUserStatus =
  (typeof AdminUserStatus)[keyof typeof AdminUserStatus];

export const AdminUserRole = {
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

export type AdminUserRole = (typeof AdminUserRole)[keyof typeof AdminUserRole];
export type AssignableAdminUserRole = Exclude<AdminUserRole, 'CUSTOMER'>;

export interface AdminUser {
  id: EntityId;
  email: string;
  firstName: string;
  lastName: string | null;
  phoneNumber: string | null;
  status: AdminUserStatus;
  roles: AdminUserRole[];
  createdAt: string;
}

export interface AdminUserListParams extends PaginationParams {
  keyword?: string;
  email?: string;
  phoneNumber?: string;
  status?: AdminUserStatus;
  role?: AdminUserRole;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  roles: AssignableAdminUserRole[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status?: AdminUserStatus;
  roles?: AssignableAdminUserRole[];
}
