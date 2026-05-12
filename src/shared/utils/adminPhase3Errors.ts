import type { AppError } from '@/shared/types/api.types';

export const PHASE3_ADMIN_ERROR_MESSAGES: Record<string, string> = {
  IDEMPOTENCY_KEY_REQUIRED:
    'Thiếu mã định danh yêu cầu. Vui lòng thử lại.',
  IDEMPOTENCY_KEY_TOO_LONG:
    'Mã định danh yêu cầu không hợp lệ.',
  IDEMPOTENCY_KEY_CONFLICT:
    'Yêu cầu bị trùng với dữ liệu khác. Vui lòng tải lại và thử lại.',
  IDEMPOTENCY_REQUEST_IN_PROGRESS:
    'Yêu cầu đang được xử lý. Vui lòng chờ trong giây lát.',
  IDEMPOTENCY_REPLAY_NOT_AVAILABLE:
    'Yêu cầu trước đó không thể khôi phục. Vui lòng thao tác lại.',
  ORDER_STATUS_INVALID:
    'Trạng thái đơn hàng đã thay đổi hoặc thao tác không còn hợp lệ.',
  PAYMENT_ALREADY_PROCESSED:
    'Thanh toán đã được xử lý trước đó.',
  CONFLICT:
    'Dữ liệu đã được thay đổi bởi thao tác khác. Vui lòng tải lại.',
  OPTIMISTIC_LOCK_CONFLICT:
    'Dữ liệu đã được thay đổi bởi thao tác khác. Vui lòng tải lại.',
  SHIPMENT_ALREADY_EXISTS:
    'Đơn hàng này đã có vận đơn. Vui lòng tải lại dữ liệu.',
};

const CONCURRENCY_ERROR_CODES = new Set(['CONFLICT', 'OPTIMISTIC_LOCK_CONFLICT']);

export function getPhase3AdminErrorMessage(error: AppError, fallbackMessage: string) {
  return PHASE3_ADMIN_ERROR_MESSAGES[error.code] ?? error.message ?? fallbackMessage;
}

export function isConcurrencyErrorCode(code?: string) {
  return code !== undefined && CONCURRENCY_ERROR_CODES.has(code);
}
