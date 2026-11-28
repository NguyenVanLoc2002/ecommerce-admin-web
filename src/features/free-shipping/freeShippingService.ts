import { apiClient } from '@/shared/lib/axios';

export type FreeShippingPolicy = { enabled: boolean; threshold: number | null; revision: number };

const path = '/admin/shipping/free-shipping-policy';

export const freeShippingService = {
  get: () => apiClient.get<FreeShippingPolicy>(path),
  update: (policy: FreeShippingPolicy) => apiClient.put<FreeShippingPolicy>(path, policy),
};
