import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import type {
  AhamoveConnectionTestResponse,
  AhamoveIntegration,
  AhamoveWebhookSetupResponse,
  AhamoveWebhookTokenResponse,
  Carrier,
  CarrierListParams,
  CreateCarrierRequest,
  TestAhamoveConnectionRequest,
  ToggleCarrierRequest,
  UpdateAhamoveIntegrationRequest,
  UpdateCarrierConfigRequest,
  UpdateCarrierRequest,
} from '../types/carrier.types';

export const carrierService = {
  getList: (params: CarrierListParams) =>
    apiClient.get<PaginatedResponse<Carrier>>('/admin/carriers', {
      params: cleanParams(params),
    }),

  getById: (id: EntityId) => apiClient.get<Carrier>(`/admin/carriers/${id}`),

  create: (body: CreateCarrierRequest) => apiClient.post<Carrier>('/admin/carriers', body),

  update: (id: EntityId, body: UpdateCarrierRequest) =>
    apiClient.patch<Carrier>(`/admin/carriers/${id}`, body),

  updateConfig: (id: EntityId, body: UpdateCarrierConfigRequest) =>
    apiClient.put<Carrier>(`/admin/carriers/${id}/config`, body),

  getAhamoveIntegration: (id: EntityId) =>
    apiClient.get<AhamoveIntegration>(`/admin/carriers/${id}/integration/ahamove`),

  updateAhamoveIntegration: (id: EntityId, body: UpdateAhamoveIntegrationRequest) =>
    apiClient.put<AhamoveIntegration>(`/admin/carriers/${id}/integration/ahamove`, body),

  testAhamoveConnection: (id: EntityId, body: TestAhamoveConnectionRequest) =>
    apiClient.post<AhamoveConnectionTestResponse>(
      `/admin/carriers/${id}/integration/ahamove/test-connection`,
      body,
    ),

  generateAhamoveWebhookToken: (id: EntityId) =>
    apiClient.post<AhamoveWebhookTokenResponse>(
      `/admin/carriers/${id}/integration/ahamove/webhook-token`,
    ),

  getAhamoveWebhookSetup: (id: EntityId) =>
    apiClient.get<AhamoveWebhookSetupResponse>(
      `/admin/carriers/${id}/integration/ahamove/webhook-setup`,
    ),

  toggle: (id: EntityId, body: ToggleCarrierRequest) =>
    apiClient.patch<Carrier>(`/admin/carriers/${id}/toggle`, body),

  getActiveOptions: () =>
    apiClient.get<PaginatedResponse<Carrier>>('/admin/carriers', {
      params: {
        page: 0,
        size: 100,
        sort: 'name,asc',
        status: 'ACTIVE',
      },
    }),
};
