import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse, PaginationParams } from '@/shared/types/api.types';
import type {
  Voucher,
  VoucherUsage,
  VoucherListParams,
  CreateVoucherRequest,
  UpdateVoucherRequest,
} from '../types/voucher.types';

export const voucherService = {
  getList: (params: VoucherListParams) =>
    apiClient.get<PaginatedResponse<Voucher>>('/admin/vouchers', { params }),

  getById: (id: number) =>
    apiClient.get<Voucher>(`/admin/vouchers/${id}`),

  getByCode: (code: string) =>
    apiClient.get<Voucher>(`/admin/vouchers/code/${code}`),

  getUsages: (id: number, params: PaginationParams) =>
    apiClient.get<PaginatedResponse<VoucherUsage>>(`/admin/vouchers/${id}/usages`, { params }),

  create: (body: CreateVoucherRequest) =>
    apiClient.post<Voucher>('/admin/vouchers', body),

  update: (id: number, body: UpdateVoucherRequest) =>
    apiClient.patch<Voucher>(`/admin/vouchers/${id}`, body),

  remove: (id: number) =>
    apiClient.delete(`/admin/vouchers/${id}`),
};
