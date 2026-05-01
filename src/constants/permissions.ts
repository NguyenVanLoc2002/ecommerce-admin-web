import { useAuthStore } from '@/shared/stores/authStore';
import type { Role } from '@/shared/types/auth.types';

// Maps each resource + action to the roles that are allowed to perform it.
// Server is the authoritative source — this is UX-only enforcement.
export const permissions = {
  products: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    delete: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
  },
  categories: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    delete: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
  },
  brands: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    delete: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
  },
  inventory: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
  },
  warehouses: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['ADMIN', 'SUPER_ADMIN'] as const,
    delete: ['ADMIN', 'SUPER_ADMIN'] as const,
  },
  orders: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
  },
  payments: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
  },
  shipments: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
  },
  invoices: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
  },
  reviews: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    delete: ['ADMIN', 'SUPER_ADMIN'] as const,
  },
  // ADMIN+ only
  vouchers: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['ADMIN', 'SUPER_ADMIN'] as const,
    delete: ['ADMIN', 'SUPER_ADMIN'] as const,
  },
  promotions: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const,
    write: ['ADMIN', 'SUPER_ADMIN'] as const,
    delete: ['ADMIN', 'SUPER_ADMIN'] as const,
  },
  auditLog: {
    read: ['ADMIN', 'SUPER_ADMIN'] as const,
  },
} as const;

type Permissions = typeof permissions;
type Resource = keyof Permissions;
type ActionOf<R extends Resource> = keyof Permissions[R];

// Returns true if the currently signed-in user has permission to perform
// `action` on `resource`. Falls back to false when unauthenticated.
export function usePermission<R extends Resource>(resource: R, action: ActionOf<R>): boolean {
  const role = useAuthStore((s) => s.role);
  if (!role) return false;
  const allowed = permissions[resource][action] as readonly Role[];
  return allowed.includes(role);
}

// Non-hook version for use outside React components (e.g. server-side checks,
// test helpers). Reads from store state directly.
export function hasPermission<R extends Resource>(resource: R, action: ActionOf<R>): boolean {
  const role = useAuthStore.getState().role;
  if (!role) return false;
  const allowed = permissions[resource][action] as readonly Role[];
  return allowed.includes(role);
}
