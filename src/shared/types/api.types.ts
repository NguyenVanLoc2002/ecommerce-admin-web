export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: FieldError[];
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
    this.fieldErrors = apiError.fieldErrors;
  }
}
