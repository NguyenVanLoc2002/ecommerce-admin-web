# Delivery Plan — Fashion Shop Admin Web

> Iterative implementation plan. Each phase builds on the previous. Designed for Claude-assisted development.

---

## Phase 0 — Foundation

**Goal**: Set up the project skeleton, shared infrastructure, and dev tooling. Nothing feature-specific. Must be complete before any feature work begins.

**Modules / Output**:

- Vite + React 18 + TypeScript (strict) project scaffold
- `tsconfig.json` with `strict: true`, path aliases (`@/`)
- `tailwind.config.ts` with semantic color tokens (primary, success, warning, danger, info)
- ESLint + Prettier config (no `any`, consistent import order)
- `src/shared/lib/axios.ts` — single Axios instance
  - Request interceptor: attach Bearer token from `authStore`
  - Response interceptor: 401 refresh + retry + queue, response unwrap, fieldError normalization, network retry (GET ×2)
- `src/shared/lib/queryClient.ts` — TanStack Query client (global `staleTime`, error handler)
- `src/shared/stores/authStore.ts` — Zustand store with `persist` middleware (accessToken, refreshToken, user, role, setTokens, setUser, clear)
- `src/shared/stores/uiStore.ts` — Zustand store (sidebarOpen, toasts, toggleSidebar, addToast, removeToast)
- `src/shared/types/api.types.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`, `FieldError`
- `src/shared/types/auth.types.ts` — `AuthUser`, `Role`, `Tokens`
- `src/shared/types/enums.ts` — all backend enums as `const` + type (OrderStatus, PaymentStatus, ShipmentStatus, InvoiceStatus, ReviewStatus, ProductStatus, VariantStatus, StockMovementType, AuditAction, PromotionScope, DiscountType, PromotionRuleType)
- `src/shared/utils/cn.ts` — clsx + tailwind-merge
- `src/shared/utils/formatMoney.ts` — locale currency formatting
- `src/shared/utils/formatDate.ts` — date/datetime formatting
- `src/constants/queryKeys.ts` — empty factory (add keys per feature)
- `src/constants/routes.ts` — all route paths (add entries per feature)
- `src/constants/permissions.ts` — full permissions map + `usePermission` hook
- `src/app/providers/QueryProvider.tsx` — wraps app with `QueryClientProvider`
- `src/app/providers/AuthProvider.tsx` — bootstraps auth state on mount (reads persisted store, validates token)
- `src/app/App.tsx` — providers composition
- `src/app/Router.tsx` — route definitions with `<AuthGuard>` and `<RoleGuard>` wrappers
- `.env.example` committed to repo

**Dependencies**: none

**Expected output**: `npm run dev` starts without errors. All shared infrastructure is in place and importable.

---

## Phase 1 — Shared UI Component Library

**Goal**: Build all shared components used across admin screens. No feature-specific code. These components must be done before building any feature screen.

**Modules / Output**:

### Primitives (`shared/components/ui/`)
- `Button` — all variants (primary, secondary, destructive, ghost, link) + all sizes + `isLoading` state using `cva`
- `Input` — text, number, password; error state; disabled state
- `Textarea` — resizable, error state
- `Select` — native or custom; error state
- `Checkbox` — styled
- `Toggle` — pill switch
- `Badge` — all status colors via `cva`; `StatusBadge` wrapper that maps status string to color
- `Tooltip` — hover tooltip with delay
- `Spinner` — small, medium, large

### Layout (`shared/components/layout/`)
- `AdminLayout` — sidebar + topbar + content area composition
- `Sidebar` — nav items, active state, user info at bottom, collapse behavior
- `Header` (topbar) — sidebar toggle, breadcrumb slot, user avatar + name + logout
- `PageHeader` — title, description, actions slot

### Table (`shared/components/table/`)
- `DataTable` — full-featured generic table:
  - Column definition with `ColumnDef<T>`
  - Sortable columns with header click
  - Row checkbox selection + header select-all
  - Built-in pagination (page, size, results count)
  - Toolbar slot (search, filter button, column visibility toggle, action button)
  - Filter chips slot
  - Bulk action bar (appears on selection)
  - Built-in loading/empty/error states
- `TableToolbar` — search input with debounce + spinner, filter/column buttons, action slot
- `FilterChips` — dismissible chips for active filters
- `BulkActionBar` — "{n} selected | [actions] | Deselect all"
- `Pagination` — page nav + page size selector

### Form (`shared/components/form/`)
- `FormField` — label + input + error message wrapper
- `FormSelect` — label + select + error
- `FormDatePicker` — date input with picker
- `FormDateTimePicker` — date + time
- `FormActions` — submit + cancel buttons row

### Feedback (`shared/components/feedback/`)
- `Toast` + `ToastContainer` — all 4 variants, queue management (max 3 visible), auto-dismiss, manual dismiss
- `SkeletonTable`, `SkeletonDetail`, `SkeletonForm`, `SkeletonTimeline`, `SkeletonStat` — shimmer variants
- `EmptyState` — icon, title, description, CTA button slot
- `ErrorCard` — message + Retry button
- `ForbiddenState` — 403 illustration + back button
- `NotFoundState` — 404 illustration + go-back link

### Overlays
- `Modal` — header, body, footer; close on Escape; overlay click behavior
- `ConfirmDialog` — built on Modal; destructive/warning variants; optional textarea input; disable confirm until filled
- `Drawer` — right-side panel for filters; header, scrollable body, footer with Reset/Apply
- `useConfirmDialog` hook — promise-based `confirm({ title, description, confirmLabel, variant })`

### Shared Hooks
- `useDebounce(value, delay)` — for search inputs
- `useTableFilters(defaults)` — syncs filter state with URL search params; debounced keyword; page reset on filter change
- `useBeforeUnload(isDirty, message)` — browser unload guard

**Dependencies**: Phase 0

**Expected output**: All shared components render correctly in isolation. Storybook or manual dev-page verification.

---

## Phase 2 — Auth

**Goal**: Login flow, session management, and route guards. Users can authenticate and be redirected correctly.

**Modules / Output**:

- `features/auth/types/` — `LoginRequest`, `LoginResponse`
- `features/auth/schemas/loginSchema.ts` — Zod schema for login form
- `features/auth/services/authService.ts` — `login()`, `logout()`, `refreshToken()`
- `features/auth/hooks/useLogin.ts` — `useMutation` calling `authService.login`, stores tokens + user, handles `INVALID_CREDENTIALS` / `ACCOUNT_DISABLED` inline errors
- `features/auth/components/LoginForm.tsx` — email + password fields, submit button with loading state, field-level error display
- `features/auth/pages/LoginPage.tsx` — centered card layout, reads `?redirect` on success navigate
- Route guards:
  - `<AuthGuard>` — redirect to `/login?redirect=<path>` if no `accessToken` in store
  - `<RoleGuard required={Role[]}>` — redirect to `/403` if current role not in required list
- 403 and 404 error pages using `ForbiddenState` and `NotFoundState`
- `queryKeys.ts`: no auth keys needed (auth uses Zustand, not TanStack Query)

**Dependencies**: Phase 0, Phase 1

**Expected output**: Login page works. Successful login stores tokens and redirects to dashboard. Failed login shows inline error. Token refresh interceptor handles expired tokens transparently. Protected routes redirect unauthenticated users.

---

## Phase 3 — Admin Layout + Dashboard

**Goal**: App shell is functional. Dashboard shows live KPI data.

**Modules / Output**:

- `app/Router.tsx` — wire all routes under `<AdminLayout>` behind `<AuthGuard>`
- Sidebar navigation with links to all major sections (products, orders, inventory, etc.)
- `features/dashboard/types/dashboard.types.ts`
- `features/dashboard/services/dashboardService.ts` — aggregates from `/admin/orders`, `/admin/payments`, `/admin/reviews/pending`, `/admin/inventories/reservations`, `/admin/shipments`
- `features/dashboard/hooks/` — `useDashboardStats`, `useRecentOrders`, `usePendingReviews`, `useLowStockAlerts`
- `features/dashboard/components/` — `KpiCard`, `RecentOrdersPanel`, `PendingReviewsPanel`, `LowStockPanel`
- `features/dashboard/pages/DashboardPage.tsx` — 2-column KPI grid + 2-column panel grid
- Dashboard loading: `skeleton-stat` × 6 + `skeleton-table` × 2
- Dashboard KPI error: card shows `—` + refresh icon; no crash

**queryKeys.ts additions**: `dashboard.orders`, `dashboard.payments`, `dashboard.pendingReviews`, `dashboard.lowStock`, `dashboard.shipmentsOutForDelivery`

**Dependencies**: Phase 2

**Expected output**: Admin can log in and see a populated dashboard. All KPI cards link to their respective filtered list screens.

---

## Phase 4 — Product & Variant Management

**Goal**: Full CRUD for products and variants. Catalog foundation for other features.

**Modules / Output**:

- `features/products/types/product.types.ts` — `Product`, `ProductVariant`, `ProductListParams`, `CreateProductRequest`, `UpdateProductRequest`, `CreateVariantRequest`, `UpdateVariantRequest`
- `features/products/schemas/` — `productSchema.ts`, `variantSchema.ts`
- `features/products/services/productService.ts` — getList, getById, create, update, remove
- `features/products/services/variantService.ts` — getByProduct, create, update, remove
- `features/products/hooks/` — `useProducts`, `useProduct`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useVariants`, `useCreateVariant`, `useUpdateVariant`, `useDeleteVariant`
- `features/products/components/` — `ProductTable`, `ProductForm`, `VariantPanel`, `VariantTable`, `VariantForm`, `ProductRowActions`, `VariantRowActions`, `ProductStatusSelect`
- `features/products/pages/` — `ProductListPage`, `ProductEditPage` (create + edit), `ProductVariantsPage`
- Unsaved changes guard on `ProductForm` and `VariantForm`
- Warning banner when publishing with 0 active variants
- Bulk actions: Publish selected, Archive selected, Delete selected

**queryKeys.ts additions**: `products.all`, `products.lists()`, `products.list(params)`, `products.detail(id)`, `variants.byProduct(productId)`, `variants.detail(id)`

**Dependencies**: Phase 3

**Expected output**: Admin can list, create, edit, publish, archive, and delete products. Variant management panel works inline on product page.

---

## Phase 5 — Category & Brand Management

**Goal**: Manage categories and brands. Required for product creation (selects reference these).

**Modules / Output**:

- `features/categories/types/`, `schemas/`, `services/categoryService.ts`, `hooks/`, `components/CategoryTable`, `CategoryFormModal`, `pages/CategoryListPage`
- `features/brands/types/`, `schemas/`, `services/brandService.ts`, `hooks/`, `components/BrandTable`, `BrandFormModal`, `pages/BrandListPage`
- Both use inline modal create/edit (not full page)
- Soft-delete confirmation dialogs with "will hide from all listings" messaging

**queryKeys.ts additions**: `categories.all`, `categories.list(params)`, `brands.all`, `brands.list(params)`

**Dependencies**: Phase 4 (product form references these)

**Expected output**: Admin can create, edit, and delete categories and brands. Category and brand selects in the product form work correctly.

---

## Phase 6 — Inventory Management

**Goal**: View and manage stock levels per variant/warehouse. Import and adjust stock.

**Modules / Output**:

- `features/inventory/types/inventory.types.ts` — `WarehouseStock`, `StockMovement`, `InventoryReservation`, `ImportStockRequest`, `AdjustStockRequest`
- `features/inventory/schemas/` — `importStockSchema.ts`, `adjustStockSchema.ts`, `warehouseSchema.ts`
- `features/inventory/services/inventoryService.ts` — getByVariant, import, adjust, getMovements, getReservations; `warehouseService.ts` — getList, create, update, remove
- `features/inventory/hooks/` — `useInventory`, `useImportStock`, `useAdjustStock`, `useStockMovements`, `useInventoryReservations`, `useWarehouses`, `useCreateWarehouse`, `useUpdateWarehouse`, `useDeleteWarehouse`
- `features/inventory/components/` — `WarehouseTable`, `WarehouseFormModal`, `InventoryGrid`, `ImportStockModal`, `AdjustStockModal`, `StockMovementsTable`, `VariantSelector`
- `features/inventory/pages/` — `WarehouseListPage`, `InventoryPage`, `ReservationsPage`
- Client-side guard: disable confirm in AdjustStockModal if `onHand + delta < reserved`
- Color-coded availability: red if < 5, amber if 5–20
- `StockMovementType` icon map per design-system spec

**queryKeys.ts additions**: `warehouses.all`, `warehouses.list(params)`, `inventory.byVariant(variantId)`, `inventory.movements(params)`, `inventory.reservations(params)`

**Dependencies**: Phase 5 (variant selector references products/variants)

**Expected output**: Admin can view per-warehouse stock, import stock, adjust stock with reason, and view reservation list. All concurrency edge cases handled (optimistic lock toast).

---

## Phase 7 — Order Management

**Goal**: Full order list + detail with status transitions. Core operational workflow.

**Modules / Output**:

- `features/orders/types/order.types.ts` — `Order`, `OrderItem`, `OrderDetail`, `OrderListParams`
- `features/orders/schemas/` — minimal (no create form; orders created by customers)
- `features/orders/services/orderService.ts` — getList, getByCode, getById, confirm, process, deliver, complete
- `features/orders/hooks/` — `useOrders`, `useOrder`, `useConfirmOrder`, `useProcessOrder`, `useDeliverOrder`, `useCompleteOrder`
- `features/orders/components/` — `OrderTable`, `OrderStatusStepper`, `OrderItemsTable`, `OrderPricingSummary`, `OrderActionPanel`, `OrderRowActions`, `AddressSnapshot`, `PaymentSummaryCard`, `ShipmentMiniCard`, `AdminNoteField`
- `features/orders/pages/` — `OrderListPage`, `OrderDetailPage`
- Bulk action: "Confirm selected" for PENDING/AWAITING_PAYMENT orders
- `ORDER_STATUS_INVALID` concurrency handling: toast + auto-reload after 1 s
- Action panel renders dynamically per current order status (see ui-spec §3.5)

**queryKeys.ts additions**: `orders.all`, `orders.lists()`, `orders.list(params)`, `orders.detail(id)`

**Dependencies**: Phase 3

**Expected output**: Admin can view all orders, filter by status/method, confirm, process, and complete orders. Detail page shows full order info and correct action buttons per status. Concurrency conflicts handled gracefully.

---

## Phase 8 — Shipment Management

**Goal**: Create and manage shipments. Status update drives order status progression.

**Modules / Output**:

- `features/shipments/types/shipment.types.ts` — `Shipment`, `ShipmentEvent`, `ShipmentListParams`, `CreateShipmentRequest`, `UpdateShipmentRequest`, `UpdateShipmentStatusRequest`
- `features/shipments/schemas/` — `createShipmentSchema.ts`, `updateStatusSchema.ts`
- `features/shipments/services/shipmentService.ts` — getList, getById, create, update, updateStatus
- `features/shipments/hooks/` — `useShipments`, `useShipment`, `useCreateShipment`, `useUpdateShipment`, `useUpdateShipmentStatus`
- `features/shipments/components/` — `ShipmentTable`, `ShipmentDetail`, `CreateShipmentForm`, `ShipmentStatusUpdateModal`, `ShipmentEventTimeline`, `ShipmentRowActions`
- `features/shipments/pages/` — `ShipmentListPage`, `ShipmentDetailPage`, `CreateShipmentPage`
- Valid next-state map drives the status select dropdown (only valid transitions shown; others disabled with tooltip)
- `DELIVERED` status update auto-triggers order `DELIVERED` — show descriptive toast
- `ORDER_STATUS_INVALID` conflict handling on status update

**queryKeys.ts additions**: `shipments.all`, `shipments.lists()`, `shipments.list(params)`, `shipments.detail(id)`

**Dependencies**: Phase 7 (create shipment linked to order; order detail links to shipment)

**Expected output**: Admin can create shipments from an order, update shipment status through the valid state machine, view event timeline. Creating a shipment auto-advances order to SHIPPED.

---

## Phase 9 — Payment Management

**Goal**: View and act on payments. Mark COD payments as paid.

**Modules / Output**:

- `features/payments/types/payment.types.ts` — `Payment`, `PaymentTransaction`, `PaymentListParams`
- `features/payments/services/paymentService.ts` — getList, getById, getTransactions, markPaid
- `features/payments/hooks/` — `usePayments`, `usePayment`, `usePaymentTransactions`, `useMarkPaymentPaid`
- `features/payments/components/` — `PaymentTable`, `PaymentDetail`, `TransactionHistoryTable`, `PaymentRowActions`
- `features/payments/pages/` — `PaymentListPage`, `PaymentDetailPage`
- "Mark as Paid" button: COD + PENDING only; confirmation dialog; `PAYMENT_ALREADY_PROCESSED` handling
- Transaction history is read-only

**queryKeys.ts additions**: `payments.all`, `payments.lists()`, `payments.list(params)`, `payments.detail(id)`, `payments.transactions(id)`

**Dependencies**: Phase 7 (payment linked from order detail)

**Expected output**: Admin can browse payments, filter by method/status, and mark COD payments as paid. Transaction history is visible and immutable.

---

## Phase 10 — Invoice Management

**Goal**: View invoices and perform status transitions (mark paid, void).

**Modules / Output**:

- `features/invoices/types/invoice.types.ts` — `Invoice`, `InvoiceLineItem`
- `features/invoices/schemas/voidInvoiceSchema.ts` — requires `note`
- `features/invoices/services/invoiceService.ts` — getById, updateStatus
- `features/invoices/hooks/` — `useInvoice`, `useMarkInvoicePaid`, `useVoidInvoice`
- `features/invoices/components/` — `InvoiceView`, `InvoiceHeader`, `LineItemsTable`, `PricingSummary`, `InvoiceActionPanel`, `VoidedWatermark`
- `features/invoices/pages/InvoicePage.tsx`
- VOIDED watermark overlay per design-system spec
- Void confirmation dialog requires mandatory note textarea

**queryKeys.ts additions**: `invoices.detail(id)`

**Dependencies**: Phase 7 (invoice linked from order detail), Phase 9 (payment linked to invoice)

**Expected output**: Admin can view invoice detail, mark as paid (ISSUED only), and void with a required note. VOIDED state shows watermark and hides all action buttons.

---

## Phase 11 — Promotion & Voucher Management

**Goal**: ADMIN+ can create and manage promotions and vouchers. Voucher list is readable by STAFF; promotions are ADMIN+ only end-to-end.

**Modules / Output**:

### Promotions

- `features/promotions/types/promotion.types.ts`
  - `Promotion` — `id`, `name`, `description`, `discountType` (`PERCENTAGE` | `FIXED_AMOUNT`), `discountValue`, `maxDiscountAmount: number | null`, `minimumOrderAmount: number | null`, `scope` (`ALL` | `CATEGORY` | `BRAND` | `PRODUCT`), `startDate`, `endDate`, `usageLimit: number | null`, `active`, `rules: PromotionRule[]`, `createdAt`, `updatedAt`
  - `PromotionRule` — `id`, `ruleType` (`MIN_ORDER_AMOUNT` | `SPECIFIC_PRODUCTS` | `SPECIFIC_CATEGORIES` | `SPECIFIC_BRANDS` | `FIRST_ORDER`), `ruleValue: string`, `description: string | null`
  - `PromotionListParams` — `name?`, `scope?`, `active?`, `dateFrom?`, `dateTo?`, `page`, `size`, `sort?` — Spring Pageable format (`sort=createdAt,desc`)
  - `CreatePromotionRequest` — all required fields per §12.1; `maxDiscountAmount` and `minimumOrderAmount` optional
  - `UpdatePromotionRequest` — all fields optional per §12.4; includes `active: boolean | null`
  - `CreateRuleRequest` — `ruleType`, `ruleValue`, `description?`

- `features/promotions/schemas/`
  - `promotionSchema.ts` — `name` max 200; `discountValue` ≥ 0.01; `discountType` enum; `scope` enum; `endDate` must be after `startDate` (cross-field refinement); `maxDiscountAmount` required when `discountType === 'PERCENTAGE'`
  - `promotionRuleSchema.ts` — `ruleType` enum; `ruleValue` non-empty string; format hint differs per `ruleType` (decimal / comma-separated IDs / `"true"`)

- `features/promotions/services/promotionService.ts`
  - `getList(params)` — `GET /admin/promotions`
  - `getById(id)` — `GET /admin/promotions/{id}`
  - `create(body)` — `POST /admin/promotions`
  - `update(id, body)` — `PATCH /admin/promotions/{id}`
  - `remove(id)` — `DELETE /admin/promotions/{id}`
  - `addRule(promotionId, body)` — `POST /admin/promotions/{id}/rules`
  - `removeRule(promotionId, ruleId)` — `DELETE /admin/promotions/{id}/rules/{ruleId}`

- `features/promotions/hooks/`
  - `usePromotions(params)`, `usePromotion(id)`
  - `useCreatePromotion`, `useUpdatePromotion`, `useDeletePromotion`
  - `useCreateRule(promotionId)`, `useDeleteRule(promotionId)` — both invalidate `promotions.detail(id)` on success

- `features/promotions/components/`
  - `PromotionTable` — columns: name, scope badge, discountType + discountValue, date range, usageLimit, active toggle, actions
  - `PromotionForm` — `maxDiscountAmount` field only rendered when `discountType === 'PERCENTAGE'`; `active` toggle visible in edit mode only; dirty state guard
  - `RuleList` — renders existing rules as chips with delete icon (ADMIN only); "Add Rule" button opens `RuleFormModal`
  - `RuleFormModal` — `ruleType` select drives `ruleValue` input helper text; for `SPECIFIC_*` types show multi-value tag input; for `FIRST_ORDER` `ruleValue` is fixed `"true"` (hidden, auto-set)
  - `PromotionRowActions` — Edit, Delete (ADMIN+ only, disabled for STAFF with tooltip)
  - `ActiveToggle` — inline PATCH `{ active }` with optimistic UI; rolls back on error

- `features/promotions/pages/`
  - `PromotionListPage` — filter drawer: `name` search, `scope` select, `active` toggle, `dateFrom`/`dateTo`; filter chips
  - `PromotionEditPage` — create and edit; `RuleList` inline below the main form; unsaved changes guard on form (rules save immediately, not as part of main form)

- Route guard: `<RoleGuard required={['ADMIN', 'SUPER_ADMIN']}>` wraps both promotion routes — STAFF redirected to `/403`

---

### Vouchers

- `features/vouchers/types/voucher.types.ts`
  - `Voucher` — `id`, `code`, `promotionId`, `promotionName`, `discountType`, `discountValue`, `maxDiscountAmount: number | null`, `minimumOrderAmount: number | null`, `usageLimit: number | null`, `usageCount`, `usageLimitPerUser: number | null`, `startDate`, `endDate`, `active`, `createdAt`
  - `VoucherUsage` — `id`, `orderId`, `orderCode`, `customerId`, `customerName`, `usedAt`, `discountAmount`
  - `VoucherListParams` — `code?`, `promotionId?`, `active?`, `dateFrom?`, `dateTo?`, `page`, `size`, `sort?` — Spring Pageable format
  - `CreateVoucherRequest` — `code?: string | null` (null → server auto-generates), `promotionId`, `usageLimit?`, `usageLimitPerUser?`, `startDate`, `endDate`
  - `UpdateVoucherRequest` — `usageLimit?`, `usageLimitPerUser?`, `startDate?`, `endDate?`, `active?` — code and promotionId are immutable after creation

- `features/vouchers/schemas/voucherSchema.ts`
  - `code` optional, max 100, uppercase alphanumeric (if provided)
  - `promotionId` required
  - `endDate` after `startDate` cross-field refinement
  - `usageLimit` ≥ 1 if provided; `usageLimitPerUser` ≥ 1 if provided

- `features/vouchers/services/voucherService.ts`
  - `getList(params)` — `GET /admin/vouchers`
  - `getById(id)` — `GET /admin/vouchers/{id}`
  - `getByCode(code)` — `GET /admin/vouchers/code/{code}`
  - `getUsages(id, params)` — `GET /admin/vouchers/{id}/usages`
  - `create(body)` — `POST /admin/vouchers`
  - `update(id, body)` — `PATCH /admin/vouchers/{id}`
  - `remove(id)` — `DELETE /admin/vouchers/{id}`

- `features/vouchers/hooks/`
  - `useVouchers(params)`, `useVoucher(id)`, `useVoucherUsages(id, params)`
  - `useCreateVoucher`, `useUpdateVoucher`, `useDeleteVoucher`

- `features/vouchers/components/`
  - `VoucherTable` — columns: code (monospace + copy icon), linked promotion, discount summary, usage (`usageCount / usageLimit` or `usageCount / ∞`), date range, active badge, actions
  - `VoucherForm` — code field: text input + "Generate" button that clears the field (empty → server generates on submit); `promotionId` select loads from `usePromotions`; code and `promotionId` fields disabled in edit mode (immutable); dirty state guard
  - `VoucherUsageTable` — read-only; columns: order code (link), customer name, used at, discount amount
  - `VoucherRowActions` — Edit, View Usages, Delete; Edit and Delete disabled for STAFF with tooltip

- `features/vouchers/pages/`
  - `VoucherListPage` — filter drawer: code search, promotion select, `active` toggle, `dateFrom`/`dateTo`; filter chips
  - `VoucherEditPage` — create and edit; `VoucherForm` with promotion linked inline summary card
  - `VoucherUsagesPage` — full usage history for one voucher; pagination

---

### RBAC Summary

| Action | STAFF | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|
| List/view promotions | ✗ (403) | ✓ | ✓ |
| Create/edit/delete promotion | ✗ | ✓ | ✓ |
| List/view vouchers | ✓ (read-only) | ✓ | ✓ |
| Create/edit/delete voucher | ✗ (disabled + tooltip) | ✓ | ✓ |

---

### Error Handling

- `VOUCHER_CODE_ALREADY_EXISTS` (409) → `form.setError('code', { message: 'This code is already in use.' })`
- `PROMOTION_NOT_FOUND` (404) on voucher create → toast error
- Soft-delete voucher confirmation: "Customers holding this code will not be able to redeem it."
- Soft-delete promotion confirmation: "This will deactivate the promotion. Existing vouchers remain valid until their own expiry."

**queryKeys.ts additions**: `promotions.all`, `promotions.lists()`, `promotions.list(params)`, `promotions.detail(id)`, `vouchers.all`, `vouchers.lists()`, `vouchers.list(params)`, `vouchers.detail(id)`, `vouchers.usages(id, params)`

**Dependencies**: Phase 3

**Expected output**: ADMIN can create promotions, add/remove rules, and create vouchers linked to a promotion. STAFF can browse and copy voucher codes but cannot create or modify anything. Voucher usage history is paginated and read-only. Code auto-generation works by leaving the field blank. Active toggle on promotions and vouchers works inline without navigating away.

---

## Phase 12 — Review Moderation

**Goal**: Admin can approve and reject customer reviews. Queue view for efficient throughput.

**Modules / Output**:

- `features/reviews/types/review.types.ts` — `Review`, `ReviewListParams`, `ModerateReviewRequest`
- `features/reviews/schemas/rejectReviewSchema.ts` — `moderationNote` min 10 chars
- `features/reviews/services/reviewService.ts` — getPending, getById, moderate
- `features/reviews/hooks/` — `usePendingReviews`, `useReview`, `useApproveReview`, `useRejectReview`
- `features/reviews/components/` — `ReviewTable`, `ReviewDetail`, `RejectModal`, `ReviewRowActions`, `BulkApproveBar`
- `features/reviews/pages/ReviewModerationPage.tsx` — dual-pane layout (list left, detail right)
- Keyboard shortcuts: `A` to approve focused review, `R` to open reject modal
- Bulk approve: sends individual requests per review; progress bar for large batches
- Rejection note: required, min 10 chars; confirm button disabled until filled
- Empty pending queue: "No reviews pending — you're all caught up!"

**queryKeys.ts additions**: `reviews.pending(params)`, `reviews.detail(id)`

**Dependencies**: Phase 3

**Expected output**: Admin can work through the review moderation queue with approve/reject actions. Rejection requires a note. Bulk approve works with progress feedback.

---

## Phase 13 — Audit Log

**Goal**: Read-only audit log for ADMIN+ with full filter/sort capability.

**Modules / Output**:

- `features/audit-log/types/auditLog.types.ts` — `AuditLog`, `AuditLogListParams`
- `features/audit-log/services/auditLogService.ts` — getList
- `features/audit-log/hooks/useAuditLogs.ts`
- `features/audit-log/components/` — `AuditLogTable`, `AuditLogChangesCell` (collapsed JSON diff → expand on click), `AuditLogFilters`
- `features/audit-log/pages/AuditLogPage.tsx`
- `<RoleGuard required={['ADMIN', 'SUPER_ADMIN']}>` on the route
- Entity ID column renders as link to relevant admin screen
- No create, edit, delete, or export actions
- Changes column: "N fields changed" collapsed → click to expand full old/new JSON diff

**queryKeys.ts additions**: `auditLog.all`, `auditLog.lists()`, `auditLog.list(params)`

**Dependencies**: Phase 3

**Expected output**: ADMIN and SUPER_ADMIN can browse the full audit log with filters by action type, entity type, admin user, and date range. STAFF is redirected to /403.

---

## Cross-Phase Notes

### Per-Phase Checklist

For every feature phase, verify before closing:

- [ ] All loading states implemented (skeleton on initial, spinner on action)
- [ ] All error states implemented (ErrorCard with retry on GET, toast on mutation)
- [ ] All empty states implemented with correct CTAs
- [ ] Filter state synced to URL search params
- [ ] All mutations invalidate the correct query keys
- [ ] RBAC enforcement on write actions (disabled + tooltip for restricted roles)
- [ ] Confirmation dialogs on all destructive actions
- [ ] Dirty state guard on all forms with meaningful data
- [ ] Field-level error display for 422 responses
- [ ] All business codes display in monospace with copy icon
- [ ] No `console.log` in committed code
- [ ] No hardcoded route strings, API paths, or color hex

### Concurrency Errors (all phases)

Whenever a mutation returns `ORDER_STATUS_INVALID`, `CONFLICT` on a status field, or optimistic lock conflict:
- Toast: "{Entity} was updated by another user. Refreshing…"
- Auto-reload the relevant query after 1 s

### Phase Dependencies Summary

```
Phase 0 (Foundation)
  └── Phase 1 (Shared UI)
        └── Phase 2 (Auth)
              └── Phase 3 (Layout + Dashboard)
                    ├── Phase 4 (Products)
                    │     └── Phase 5 (Categories + Brands)
                    │           └── Phase 6 (Inventory)
                    ├── Phase 7 (Orders)
                    │     ├── Phase 8 (Shipments)
                    │     ├── Phase 9 (Payments)
                    │     └── Phase 10 (Invoices)
                    ├── Phase 11 (Promotions + Vouchers)
                    ├── Phase 12 (Reviews)
                    └── Phase 13 (Audit Log)
```

Phases 4–6, 7–10, 11, 12, and 13 can proceed in parallel once Phase 3 is complete.
