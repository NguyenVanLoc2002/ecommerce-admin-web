import type {
  EntityId,
  PaginationParams,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';

export const CustomerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
} as const;

export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus];

export const CustomerGender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type CustomerGender = (typeof CustomerGender)[keyof typeof CustomerGender];

export interface AdminCustomer extends SoftDeletableRecord {
  id: EntityId;
  userId: EntityId;
  email: string;
  firstName: string;
  lastName: string | null;
  phoneNumber: string | null;
  status: CustomerStatus;
  gender: CustomerGender | null;
  birthDate: string | null;
  avatarUrl: string | null;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomerFilter extends PaginationParams, SoftDeleteFilterParams {
  keyword?: string;
  email?: string;
  phoneNumber?: string;
  status?: CustomerStatus;
  gender?: CustomerGender;
  minLoyaltyPoints?: number;
  maxLoyaltyPoints?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: CustomerGender;
  birthDate?: string;
  avatarUrl?: string;
}

export interface UpdateCustomerStatusRequest {
  status: CustomerStatus;
}
