import { apiClient } from '@/shared/lib/axios';

export type TaxTreatment = 'TAXABLE' | 'NON_TAXABLE';
export type TaxCategory = { code: string; name: string; treatment: TaxTreatment; active: boolean; revision: number };
export type TaxRate = { fraction: number; effectiveFrom: string; effectiveUntil: string | null; active: boolean };
export type TaxSchedule = { category: TaxCategory; rates: TaxRate[] };
export type TaxAudit = { id: number; actor: string; event: string; details: string; changedAt: string };
export type TaxEstimate = {
  taxDate: string;
  currency: string;
  gross: number;
  net: number;
  vat: number;
  lines: { lineKey: string; categoryCode: string; rateFraction: number; gross: number; net: number; vat: number }[];
};

const root = '/admin/tax';

export const taxService = {
  list: () => apiClient.get<TaxCategory[]>(root + '/categories'),
  get: (code: string) => apiClient.get<TaxSchedule>(root + '/categories/' + encodeURIComponent(code)),
  create: (input: Pick<TaxCategory, 'code' | 'name' | 'treatment'>) =>
    apiClient.post<TaxCategory>(root + '/categories', input),
  update: (code: string, input: Pick<TaxCategory, 'name' | 'active'>) =>
    apiClient.put<TaxCategory>(root + '/categories/' + encodeURIComponent(code), input),
  configure: (code: string, revision: number, rates: TaxRate[]) =>
    apiClient.put<TaxSchedule>(root + '/categories/' + encodeURIComponent(code) + '/schedule', { revision, rates }),
  assignment: (id: string) => apiClient.get<{ categoryCode: string | null }>(root + '/assignments/' + id),
  assign: (id: string, categoryCode: string | null) =>
    apiClient.put<{ categoryCode: string | null }>(root + '/assignments/' + id, { categoryCode }),
  audit: (subject: string, before: number) =>
    apiClient.get<TaxAudit[]>(root + '/audit/' + encodeURIComponent(subject), { params: { before } }),
  estimate: (id: string) => apiClient.get<TaxEstimate>(root + '/orders/' + id + '/estimate'),
  finalized: (id: string) => apiClient.get<{ amounts: TaxEstimate }>(root + '/orders/' + id + '/final'),
};
