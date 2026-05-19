import type { EntityId, PaginationParams } from '@/shared/types/api.types';
import type { CarrierProviderType, EntityStatus } from '@/shared/types/enums';

export const CARRIER_PROVIDER_TYPE_VALUES = [
  'MANUAL',
  'MOCK',
  'AHAMOVE',
  'GHN',
  'GHTK',
] as const satisfies readonly CarrierProviderType[];

export const CARRIER_STATUS_VALUES = ['ACTIVE', 'INACTIVE'] as const satisfies readonly EntityStatus[];

export interface Carrier {
  id: EntityId;
  code: string;
  name: string;
  providerType: CarrierProviderType;
  status: EntityStatus;
  logoUrl: string | null;
  description: string | null;
  configEnabled: boolean;
  baseUrl: string | null;
  hasApiKey: boolean;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  configJson: string | null;
  connectionStatus: string | null;
  lastHealthCheckAt: string | null;
  lastHealthCheckError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CarrierListParams extends PaginationParams {
  keyword?: string;
  providerType?: CarrierProviderType;
  status?: EntityStatus;
  enabled?: boolean;
}

export interface CreateCarrierRequest {
  code: string;
  name: string;
  providerType: CarrierProviderType;
  status?: EntityStatus;
  logoUrl?: string | null;
  description?: string | null;
}

export type UpdateCarrierRequest = Partial<CreateCarrierRequest>;

export interface UpdateCarrierConfigRequest {
  apiKey?: string | null;
  secretKey?: string | null;
  webhookSecret?: string | null;
  baseUrl?: string | null;
  enabled?: boolean;
  configJson?: string | null;
}

export interface AhamoveIntegration {
  carrierId: EntityId;
  carrierCode: string;
  carrierName: string;
  enabled: boolean;
  baseUrl: string | null;
  hasApiKey: boolean;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  phone: string | null;
  brandName: string | null;
  pickupAddress: string | null;
  pickupShortAddress: string | null;
  pickupName: string | null;
  pickupPhone: string | null;
  pickupLat: number | null;
  pickupLng: number | null;
  defaultServiceCode: string | null;
  defaultPaymentMethod: string | null;
  connectionStatus: string | null;
  lastHealthCheckAt: string | null;
  lastHealthCheckError: string | null;
  maskedWebhookToken: string | null;
}

export interface UpdateAhamoveIntegrationRequest {
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  baseUrl?: string;
  enabled?: boolean;
  phone?: string;
  brandName?: string;
  pickupAddress?: string;
  pickupShortAddress?: string;
  pickupName?: string;
  pickupPhone?: string;
  pickupLat?: number;
  pickupLng?: number;
  defaultServiceCode?: string;
  defaultPaymentMethod?: string;
}

export interface TestAhamoveConnectionRequest {
  apiKey?: string;
  baseUrl?: string;
  phone?: string;
}

export interface AhamoveConnectionTestResponse {
  success: boolean;
  status: 'NOT_CONFIGURED' | 'CONNECTED' | 'FAILED' | string;
  message: string;
  resolvedBaseUrl: string | null;
  resolvedPhone: string | null;
}

export interface AhamoveWebhookTokenResponse {
  token: string;
  maskedToken: string | null;
  generatedAt: string;
}

export interface AhamoveWebhookSetupResponse {
  webhookUrl: string;
  authHeader: string;
  authScheme: string | null;
  hasWebhookToken: boolean;
  maskedWebhookToken: string | null;
  instructions: string[];
}

export interface ToggleCarrierRequest {
  active: boolean;
}
