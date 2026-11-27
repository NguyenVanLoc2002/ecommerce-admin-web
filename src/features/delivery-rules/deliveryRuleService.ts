import { apiClient } from '@/shared/lib/axios';

export type DeliveryRoute = {
  carrierId: string;
  serviceCode: string;
  warehouseId: string;
  provinceCode: string;
  wardCode: string | null;
};

export type DeliveryTerms = {
  calendarId: string;
  minBusinessDays: number;
  maxBusinessDays: number;
  priority: number;
  effectiveFrom: string;
  effectiveUntil: string | null;
  active: boolean;
  guaranteed: boolean;
  coverageReference: string | null;
};

export type DeliveryRule = { id: string; revision: number; route: DeliveryRoute; terms: DeliveryTerms };
export type Location = { code: string; name: string };
type Calendar = { id: string; name: string };
type Change = { revision: number; changedBy: string; changedAt: string; rule: DeliveryRule };
type Page<T> = { items: T[]; hasNext: boolean };
type Preview = {
  ruleId: string;
  ruleRevision: number;
  calendarRevision: number;
  minBusinessDays: number;
  maxBusinessDays: number;
  guaranteed: boolean;
  source: 'POLICY';
  referenceEvent: 'CARRIER_HANDOVER';
};

const path = '/admin/shipping/delivery-rules';

export const deliveryRuleService = {
  list: (carrierId: string, page: number) => apiClient.get<Page<DeliveryRule>>(path, { params: { carrierId, page } }),
  create: (route: DeliveryRoute, terms: DeliveryTerms) => apiClient.post<DeliveryRule>(path, { route, terms }),
  edit: (id: string, revision: number, terms: DeliveryTerms) =>
    apiClient.put<DeliveryRule>(path + '/' + id, { revision, terms }),
  history: (id: string, page: number) => apiClient.get<Page<Change>>(path + '/' + id + '/history', { params: { page } }),
  calendars: () => apiClient.get<Calendar[]>(path + '/calendar-options'),
  provinces: () => apiClient.get<Location[]>('/locations/provinces'),
  wards: (code: string) => apiClient.get<Location[]>('/locations/provinces/' + code + '/wards'),
  preview: (destination: DeliveryRoute, onDate: string) =>
    apiClient.post<{ estimate: Preview | null }>(path + '/preview', { destination, onDate }),
};
