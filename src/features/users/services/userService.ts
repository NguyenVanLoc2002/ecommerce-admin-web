import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import type {
  AdminUser,
  AdminUserListParams,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user.types';

export const userService = {
  getList: (params: AdminUserListParams) =>
    apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', {
      params: cleanParams(params),
    }),

  getById: (id: EntityId) => apiClient.get<AdminUser>(`/admin/users/${id}`),

  create: (body: CreateUserRequest) => apiClient.post<AdminUser>('/admin/users', body),

  update: (id: EntityId, body: UpdateUserRequest) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}`, body),

  remove: (id: EntityId) => apiClient.delete(`/admin/users/${id}`),
};
