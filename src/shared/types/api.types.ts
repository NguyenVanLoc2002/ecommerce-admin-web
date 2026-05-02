export type EntityId = string;
export type EntityKey = string | number;

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  path: string;
  timestamp: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

export const SoftDeleteState = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
  ALL: 'ALL',
} as const;

export type SoftDeleteState = (typeof SoftDeleteState)[keyof typeof SoftDeleteState];

export interface SoftDeleteFilterParams {
  deletedState?: SoftDeleteState;
}

export interface SoftDeleteQueryParams {
  isDeleted?: boolean;
  includeDeleted?: boolean;
}

export interface SoftDeletableRecord {
  isDeleted?: boolean;
}

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
  onRetry?: () => void;
}

export class AppError extends Error {
  readonly code: string;
  readonly fieldErrors?: FieldError[];

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'AppError';
    this.code = apiError.code;
    this.fieldErrors = apiError.errors;
  }
}
