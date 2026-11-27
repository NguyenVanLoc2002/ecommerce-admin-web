import { apiClient } from '@/shared/lib/axios';

export type PolicyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PolicyDraft = { title: string; content: string; effectiveFrom: string };

export type PolicySummary = Omit<PolicyDraft, 'content'> & {
  version: number;
  revision: number;
  status: PolicyStatus;
  publishedAt: string | null;
};

export type Policy = PolicySummary & { content: string; publishedBy: string | null };

export type PolicyChange = PolicyDraft & {
  revision: number;
  status: PolicyStatus;
  actor: string;
  changedAt: string;
};

type Page<T> = { items: T[]; hasNext: boolean };
type Capabilities = { canEdit: boolean; canPublish: boolean; publicationEnabled: boolean };

const path = '/admin/policies/shipping';

export const shippingPolicyService = {
  capabilities: () => apiClient.get<Capabilities>(path + '/capabilities'),
  list: (page: number) => apiClient.get<Page<PolicySummary>>(path, { params: { page } }),
  get: (version: number) => apiClient.get<Policy>(path + '/' + version),
  create: (draft: PolicyDraft) => apiClient.post<Policy>(path, draft),
  edit: (version: number, revision: number, draft: PolicyDraft) =>
    apiClient.put<Policy>(path + '/' + version, { revision, draft }),
  changeStatus: (version: number, revision: number, action: 'publish' | 'archive') =>
    apiClient.post<Policy>(path + '/' + version + '/' + action, { revision }),
  history: (version: number, page: number) =>
    apiClient.get<Page<PolicyChange>>(path + '/' + version + '/history', { params: { page } }),
};
