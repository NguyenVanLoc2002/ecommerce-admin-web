import { apiClient } from '@/shared/lib/axios';

export type CalendarPurpose = 'WAREHOUSE_PROCESSING' | 'CARRIER_TRANSPORT';
export type WorkingDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type CalendarInput = {
  name: string;
  purpose: CalendarPurpose;
  workdays: WorkingDay[];
  opensAt: string;
  cutoffAt: string;
  closesAt: string;
  holidays: { date: string; name: string }[];
  active: boolean;
};

export type ShippingCalendar = { id: string; revision: number; calendar: CalendarInput; timeZone: string };
type Summary = Pick<CalendarInput, 'name' | 'purpose' | 'active'> & Pick<ShippingCalendar, 'id' | 'revision'>;
type Change = { revision: number; changedBy: string; changedAt: string; calendar: CalendarInput };
type Page<T> = { items: T[]; hasNext: boolean };

const path = '/admin/shipping/calendars';

export const shippingCalendarService = {
  list: (page: number) => apiClient.get<Page<Summary>>(path, { params: { page } }),
  get: (id: string) => apiClient.get<ShippingCalendar>(path + '/' + id),
  create: (input: CalendarInput) => apiClient.post<ShippingCalendar>(path, input),
  edit: (id: string, revision: number, calendar: CalendarInput) =>
    apiClient.put<ShippingCalendar>(path + '/' + id, { revision, calendar }),
  history: (id: string, page: number) => apiClient.get<Page<Change>>(path + '/' + id + '/history', { params: { page } }),
  previewProcessing: (id: string, eligibleAt: string) =>
    apiClient.post<{ processingStartsAt: string }>(path + '/' + id + '/preview-processing', { eligibleAt }),
  previewDelivery: (id: string, handoverDate: string, minBusinessDays: number, maxBusinessDays: number) =>
    apiClient.post<{ earliest: string; latest: string }>(path + '/' + id + '/preview-delivery', {
      handoverDate, minBusinessDays, maxBusinessDays,
    }),
};
