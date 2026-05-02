import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';
import type {
  AdminCustomer,
  AdminCustomerFilter,
  UpdateCustomerRequest,
  UpdateCustomerStatusRequest,
} from '../types/customer.types';

export const customerService = {
  getList: ({ deletedState, ...params }: AdminCustomerFilter) =>
    apiClient.get<PaginatedResponse<AdminCustomer>>('/admin/customers', {
      params: cleanParams({
        ...params,
        ...toSoftDeleteQuery(deletedState),
      }),
    }),

  getById: (id: EntityId) =>
    apiClient.get<AdminCustomer>(`/admin/customers/${id}`),

  update: (id: EntityId, body: UpdateCustomerRequest) =>
    apiClient.patch<AdminCustomer>(`/admin/customers/${id}`, body),

  updateStatus: (id: EntityId, body: UpdateCustomerStatusRequest) =>
    apiClient.patch<AdminCustomer>(`/admin/customers/${id}/status`, body),

  remove: (id: EntityId) => apiClient.delete<void>(`/admin/customers/${id}`),
};
