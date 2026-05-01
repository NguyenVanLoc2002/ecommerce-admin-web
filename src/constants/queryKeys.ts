import type { EntityKey } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';

// Centralised TanStack Query key factory.
// Each feature adds its own block here when implemented.
// Use the factory pattern: keys at each level are stable references so
// invalidateQueries({ queryKey: queryKeys.products.lists() }) works correctly.

export const queryKeys = {
  // ── Phase 3: Dashboard ──────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    orders: () => [...queryKeys.dashboard.all, 'orders'] as const,
    payments: () => [...queryKeys.dashboard.all, 'payments'] as const,
    pendingReviews: () => [...queryKeys.dashboard.all, 'pendingReviews'] as const,
    lowStock: () => [...queryKeys.dashboard.all, 'lowStock'] as const,
    shipmentsOutForDelivery: () =>
      [...queryKeys.dashboard.all, 'shipmentsOutForDelivery'] as const,
  },

  // ── Phase 4: Products ───────────────────────────────────────────────────
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.products.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) => [...queryKeys.products.all, 'detail', id] as const,
  },

  variants: {
    all: ['variants'] as const,
    byProduct: (productId: EntityKey) =>
      [...queryKeys.variants.all, 'byProduct', productId] as const,
    detail: (id: EntityKey) => [...queryKeys.variants.all, 'detail', id] as const,
  },

  productAttributes: {
    all: ['productAttributes'] as const,
    lists: () => [...queryKeys.productAttributes.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.productAttributes.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) =>
      [...queryKeys.productAttributes.all, 'detail', id] as const,
    variantOptions: () =>
      [...queryKeys.productAttributes.all, 'variantOptions'] as const,
  },

  // ── Phase 5: Categories & Brands ────────────────────────────────────────
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.categories.lists(), cleanParams(params)] as const,
  },

  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.brands.lists(), cleanParams(params)] as const,
  },

  // ── Phase 6: Inventory ──────────────────────────────────────────────────
  warehouses: {
    all: ['warehouses'] as const,
    lists: () => [...queryKeys.warehouses.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.warehouses.lists(), cleanParams(params)] as const,
  },

  inventory: {
    all: ['inventory'] as const,
    stock: (params: object) =>
      [...queryKeys.inventory.all, 'stock', cleanParams(params)] as const,
    byVariant: (variantId: EntityKey) =>
      [...queryKeys.inventory.all, 'variant', variantId] as const,
    movements: (params: object) =>
      [...queryKeys.inventory.all, 'movements', cleanParams(params)] as const,
    reservations: (params: object) =>
      [...queryKeys.inventory.all, 'reservations', cleanParams(params)] as const,
  },

  // ── Phase 7: Orders ─────────────────────────────────────────────────────
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.orders.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) => [...queryKeys.orders.all, 'detail', id] as const,
  },

  // ── Phase 8: Shipments ──────────────────────────────────────────────────
  shipments: {
    all: ['shipments'] as const,
    lists: () => [...queryKeys.shipments.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.shipments.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) => [...queryKeys.shipments.all, 'detail', id] as const,
    events: (id: EntityKey) => [...queryKeys.shipments.all, 'events', id] as const,
  },

  // ── Phase 9: Payments ───────────────────────────────────────────────────
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.payments.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) => [...queryKeys.payments.all, 'detail', id] as const,
    transactions: (id: EntityKey) =>
      [...queryKeys.payments.all, 'transactions', id] as const,
  },

  // ── Phase 10: Invoices ──────────────────────────────────────────────────
  invoices: {
    all: ['invoices'] as const,
    detail: (id: EntityKey) => [...queryKeys.invoices.all, 'detail', id] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.invoices.lists(), cleanParams(params)] as const,
  },

  // ── Phase 11: Promotions & Vouchers ─────────────────────────────────────
  promotions: {
    all: ['promotions'] as const,
    lists: () => [...queryKeys.promotions.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.promotions.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) => [...queryKeys.promotions.all, 'detail', id] as const,
  },

  vouchers: {
    all: ['vouchers'] as const,
    lists: () => [...queryKeys.vouchers.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.vouchers.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) => [...queryKeys.vouchers.all, 'detail', id] as const,
    usages: (id: EntityKey, params: object) =>
      [...queryKeys.vouchers.all, 'usages', id, cleanParams(params)] as const,
  },

  // ── Phase 12: Reviews ───────────────────────────────────────────────────
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.reviews.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) => [...queryKeys.reviews.all, 'detail', id] as const,
  },

  // ── Phase 13: Audit Log ─────────────────────────────────────────────────
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.users.lists(), cleanParams(params)] as const,
    detail: (id: EntityKey) => [...queryKeys.users.all, 'detail', id] as const,
  },

  auditLog: {
    all: ['auditLog'] as const,
    lists: () => [...queryKeys.auditLog.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.auditLog.lists(), cleanParams(params)] as const,
  },
};
