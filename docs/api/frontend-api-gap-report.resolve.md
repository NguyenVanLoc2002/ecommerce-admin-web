# Frontend–API Integration Gap Report

> **Generated:** 2026-04-19
> **Audited against:** `docs/api/admin-api-contract.md` + `docs/api/api-common.md`
> **Frontend codebase:** `src/` (Phase 0–8 implementation)
>
> This report lists every mismatch between the current frontend assumptions and the real backend API contract.
> **Do not refactor until this report is reviewed and prioritised.**

---

## Summary

| Impact | Count |
|---|---|
| Critical | 9 |
| High | 5 |
| Medium | 11 |
| Low | 3 |
| **Total** | **28** |

---

## Critical Issues

These issues will cause complete runtime failures: blank screens, 404 errors, or zero data rendered.

---

### GAP-001 — `PaginatedResponse` type uses Spring Page fields; backend uses custom pagination shape

**Feature/Module:** All list features (products, orders, shipments, payments, categories, brands, inventory, reviews, vouchers, promotions)

**File:** `src/shared/types/api.types.ts:9-15`

**Current frontend assumption:**
```ts
export interface PaginatedResponse<T> {
  content: T[];       // Spring Data field name
  totalElements: number;
  totalPages: number;
  number: number;     // current page
  size: number;
}
```
Every list page accesses `data.content`, `data.totalElements`, `data.number`.

Example from `ProductListPage.tsx:45`:
```ts
(brandsData?.content ?? []).map(...)
```

**Actual backend contract** (`api-common.md §6`):
```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalItems": 125,
  "totalPages": 7,
  "hasNext": true,
  "hasPrevious": false
}
```

**Field mapping delta:**
| Frontend | Backend | Notes |
|---|---|---|
| `content` | `items` | **Breaking** — all arrays will be `undefined` |
| `totalElements` | `totalItems` | Pagination count wrong |
| `number` | `page` | Current page always wrong |
| — | `hasNext` | Missing from type |
| — | `hasPrevious` | Missing from type |

**Impact:** Every single list screen will render empty. Pagination controls will show incorrect totals. This is the single highest-impact bug in the codebase.

**Fix needed:**
1. Update `PaginatedResponse<T>` in `api.types.ts`:
```ts
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```
2. Update all component references from `data.content` → `data.items`, `data.totalElements` → `data.totalItems`, `data.number` → `data.page`.
3. Update `Pagination` component in `shared/components/table/Pagination.tsx`.

---

### GAP-002 — Validation error field name mismatch: `fieldErrors` vs `errors`

**Feature/Module:** All forms with server-side field validation

**File:** `src/shared/types/api.types.ts:17-29`, `src/shared/lib/axios.ts:144-147`

**Current frontend assumption:**
```ts
export interface ApiError {
  fieldErrors?: FieldError[];  // "fieldErrors" key assumed
}

export class AppError extends Error {
  readonly fieldErrors?: FieldError[];
  constructor(apiError: ApiError) {
    this.fieldErrors = apiError.fieldErrors; // reads non-existent key
  }
}
```
All mutation `onError` handlers check `error.fieldErrors?.length` to decide whether to show per-field errors.

**Actual backend contract** (`api-common.md §3.4`):
```json
{
  "errors": [
    { "field": "email", "message": "Email is invalid" }
  ]
}
```
The JSON key is `errors`, not `fieldErrors`.

**Impact:** `apiError.fieldErrors` is always `undefined`. Every form's per-field error display will never fire. All 422 validation errors silently fall back to the generic toast. No inline field error messages will ever appear.

**Fix needed:**
1. Update `ApiError.fieldErrors` → `ApiError.errors` in `api.types.ts`.
2. Update `AppError` constructor: `this.fieldErrors = apiError.errors`.
3. All `error.fieldErrors` references in mutation handlers remain unchanged (they read from `AppError.fieldErrors` which is the normalised name).

---

### GAP-003 — Order status transitions use wrong endpoint pattern

**Feature/Module:** Orders

**File:** `src/features/orders/services/orderService.ts:17-19`, `src/features/orders/hooks/useUpdateOrderStatus.ts`, `src/features/orders/components/OrderActionPanel.tsx`

**Current frontend assumption:**
```ts
updateStatus: (id: number, body: UpdateOrderStatusRequest) =>
  apiClient.patch<Order>(`/admin/orders/${id}/status`, body),
// body = { status: OrderStatus, note?: string }
```
Uses a single generic `PATCH /admin/orders/{id}/status` endpoint for all transitions.

**Actual backend contract** (`admin-api-contract.md §8`):
Each transition is a separate dedicated `POST` endpoint with no request body:

| Transition | Endpoint |
|---|---|
| PENDING/AWAITING_PAYMENT → CONFIRMED | `POST /api/v1/admin/orders/{id}/confirm` |
| CONFIRMED → PROCESSING | `POST /api/v1/admin/orders/{id}/process` |
| SHIPPED → DELIVERED | `POST /api/v1/admin/orders/{id}/deliver` |
| DELIVERED → COMPLETED | `POST /api/v1/admin/orders/{id}/complete` |
| Cancel order | `POST /api/v1/admin/orders/{id}/cancel` |

`PATCH /admin/orders/{id}/status` **does not exist**. Every order action button will return 404.

**Also:** `OrderActionPanel.tsx` allows cancellation from `PROCESSING` status, but backend only allows cancel from `PENDING`, `AWAITING_PAYMENT`, `CONFIRMED`.

**Fix needed:**
1. Remove `orderService.updateStatus`.
2. Add individual service methods: `confirm`, `process`, `deliver`, `complete`, `cancel`.
3. Update `useUpdateOrderStatus` hook (or split into separate mutation hooks per action).
4. Update `OrderActionPanel` to call the correct method per `nextStatus`.
5. Remove `PROCESSING` → `CANCELLED` action from `STATUS_ACTIONS`.

---

### GAP-004 — Payment mark-paid uses wrong endpoint and wrong ID

**Feature/Module:** Payments

**File:** `src/features/payments/services/paymentService.ts:15-17`

**Current frontend assumption:**
```ts
markPaid: (id: number) =>
  apiClient.post<Payment>(`/admin/payments/${id}/mark-paid`),
// id = paymentId
```

**Actual backend contract** (`admin-api-contract.md §9.5`):
```
POST /api/v1/admin/payments/order/{orderId}/complete
```
- Takes **orderId** (not paymentId)
- Path segment is `complete`, not `mark-paid`

**Impact:** 404 on every COD payment completion. The endpoint does not exist. Additionally, `useMarkPaymentPaid` receives `paymentId` but needs `orderId` — the call site must also be updated.

**Fix needed:**
1. Rename `markPaid(id: number)` → `completeCodPayment(orderId: number)`.
2. Change URL to `/admin/payments/order/${orderId}/complete`.
3. Update `useMarkPaymentPaid` hook parameter type to accept `orderId`.
4. Update all call sites in `PaymentDetail` component.

---

### GAP-005 — Inventory endpoints are entirely wrong

**Feature/Module:** Inventory

**File:** `src/features/inventory/services/inventoryService.ts`

**Current frontend assumption:**
```ts
getStock:       GET  /admin/inventory/stock
importStock:    POST /admin/inventory/import
adjustStock:    POST /admin/inventory/adjust
getMovements:   GET  /admin/inventory/movements
getReservations: GET  /admin/inventory/reservations
```

**Actual backend contract** (`admin-api-contract.md §7`):
```
GET  /api/v1/admin/inventories/variant/{variantId}
GET  /api/v1/admin/inventories/warehouse/{warehouseId}
GET  /api/v1/admin/inventories/variant/{variantId}/warehouse/{warehouseId}
GET  /api/v1/admin/inventories/movements
POST /api/v1/admin/inventories/adjust    ← (single endpoint for import/export/adjust/return)
POST /api/v1/admin/inventories/reserve
POST /api/v1/admin/inventories/release
```

Key differences:
1. **Path prefix:** `/inventory` (singular) → `/inventories` (plural). All URLs are 404.
2. **No flat stock list endpoint.** Stock is fetched by variant or warehouse ID; there is no `/inventory/stock` list.
3. **`importStock` doesn't exist.** Import is done via `POST /inventories/adjust` with `movementType: 'IMPORT'`.
4. **`getReservations` endpoint doesn't exist** in the documented contract.
5. **Adjust request body mismatch** (see GAP-006).

**Fix needed:**
1. Rewrite `inventoryService` to match actual endpoints.
2. Remove `importStock` — merge into `adjustStock` with `movementType: 'IMPORT'`.
3. Remove `getStock` — use `getByVariant(variantId)` or `getByWarehouse(warehouseId)`.
4. Update all hooks and components that use `getStock`, `importStock`, `getReservations`.

---

### GAP-006 — Inventory adjust request body mismatch

**Feature/Module:** Inventory

**File:** `src/features/inventory/types/inventory.types.ts:57-63`

**Current frontend assumption:**
```ts
export interface AdjustStockRequest {
  warehouseId: number;
  variantId: number;
  quantity: number;
  reason: StockAdjustmentReason;  // DAMAGE | RETURN | CORRECTION | OTHER
  note: string;
}
```

**Actual backend contract** (`admin-api-contract.md §7.10`):
```json
{
  "variantId": 1,
  "warehouseId": 1,
  "quantity": 50,
  "movementType": "IMPORT",   // IMPORT | EXPORT | ADJUSTMENT | RETURN
  "note": "..."
}
```

- `reason` field does not exist in the backend. The backend uses `movementType`.
- `movementType` values are `IMPORT | EXPORT | ADJUSTMENT | RETURN` — different from frontend's `StockAdjustmentReason` enum.
- The `ImportStockRequest` struct is redundant — `IMPORT` is just `movementType: 'IMPORT'` in `adjustStock`.

**Fix needed:**
1. Replace `reason: StockAdjustmentReason` → `movementType: StockMovementType` in `AdjustStockRequest`.
2. Remove `ImportStockRequest` type entirely.
3. Update `AdjustStockModal`, `ImportStockModal`, `adjustStockSchema`, `importStockSchema`.

---

### GAP-007 — `ProductStatus` enum uses `ARCHIVED` instead of `INACTIVE`

**Feature/Module:** Products

**File:** `src/shared/types/enums.ts:54-59`

**Current frontend assumption:**
```ts
export const ProductStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',  // wrong
} as const;
```

**Actual backend contract** (`api-common.md §8 — ProductStatus`):
```
DRAFT | PUBLISHED | INACTIVE
```

The backend uses `INACTIVE`, not `ARCHIVED`.

**Impact:**
- Products returned from API with `status: 'INACTIVE'` will not match any known enum value.
- Bulk "Archive" action in `ProductListPage` sends `status: 'ARCHIVED'` which the backend will reject as invalid.
- Status badge, filter dropdown will show incorrect labels for inactive products.

**Fix needed:**
1. Change `ARCHIVED: 'ARCHIVED'` → `INACTIVE: 'INACTIVE'` in `ProductStatus`.
2. Update all references: `ProductListPage.handleBulkArchive`, `ProductFiltersDrawer`, `productSchema`, any status badge renderer.

---

### GAP-008 — `StockMovementType` enum has wrong values

**Feature/Module:** Inventory

**File:** `src/shared/types/enums.ts:67-74`

**Current frontend assumption:**
```ts
export const StockMovementType = {
  IMPORT: 'IMPORT',
  ADJUSTMENT: 'ADJUSTMENT',
  RESERVATION: 'RESERVATION',  // does not exist in backend
  RELEASE: 'RELEASE',          // does not exist in backend
  FULFILLMENT: 'FULFILLMENT',  // does not exist in backend
} as const;
```

**Actual backend contract** (`api-common.md §8 — StockMovementType`):
```
IMPORT | EXPORT | ADJUSTMENT | RETURN
```

Frontend is missing `EXPORT` and `RETURN`; has three fake values (`RESERVATION`, `RELEASE`, `FULFILLMENT`).

**Fix needed:**
```ts
export const StockMovementType = {
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  ADJUSTMENT: 'ADJUSTMENT',
  RETURN: 'RETURN',
} as const;
```
Update `StockMovementsTable`, `adjustStockSchema`, filter dropdowns.

---

### GAP-009 — Auth login response shape is assumed to be nested; likely flat

**Feature/Module:** Auth

**File:** `src/shared/types/auth.types.ts:36-39`, `src/features/auth/hooks/useLogin.ts:13-14`

**Current frontend assumption:**
```ts
export interface LoginResponse {
  user: AuthUser;
  tokens: LoginTokens;  // { accessToken, refreshToken, tokenType, expiresIn }
}

// useLogin hook:
setTokens({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
setUser(data.user);
```

**Actual backend contract** (`api-common.md §2` token lifecycle summary):
```
POST /auth/login → { accessToken, refreshToken }
```
The refresh token endpoint returns `{ accessToken, refreshToken }` as a flat object inside `data`. There is no nested `tokens` key shown in any documented response.

**Impact:** If the actual backend login response is `{ accessToken, refreshToken, user }` (flat, like refresh), then `data.tokens` is `undefined` and login will break silently — tokens won't be stored, the user stays unauthenticated.

**Fix needed:** Verify the actual backend `LoginResponse` DTO. If the response is flat (`{ accessToken, refreshToken, user }`), update `LoginResponse` type and `useLogin` hook:
```ts
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
// useLogin:
setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
setUser(data.user);
```

---

## High Impact Issues

These issues will cause wrong data display or incorrect API calls but won't necessarily produce errors immediately.

---

### GAP-010 — Order response field names don't match backend

**Feature/Module:** Orders

**File:** `src/features/orders/types/order.types.ts:58-75`

**Current frontend `Order` type vs actual backend response** (`admin-api-contract.md §8.2`):

| Frontend field | Backend field | Notes |
|---|---|---|
| `code` | `orderCode` | Different key name |
| `customer` (object: `{id, fullName, email, phone}`) | `customerId` (just a number) | Backend only returns ID, not a customer object |
| `shippingAddress` (nested object) | Flat fields: `shippingStreet`, `shippingWard`, `shippingDistrict`, `shippingCity`, `shippingPostalCode` | Structure is completely different |
| `subtotal` | `subTotal` | Case difference |
| `total` | `totalAmount` | Different name |
| `note` | `customerNote` | Different name |
| — | `voucherCode` | Missing from `Order` type |

The same applies to `OrderSummary.code` (should be `orderCode`) and the `customer` nested object (backend only has `customerId`).

**Also:** `OrderItem` field names are wrong:

| Frontend | Backend |
|---|---|
| `variantSku` | `sku` |
| `subtotal` | `lineTotal` |
| `discount` | `discountAmount` |

**Fix needed:** Rewrite `Order`, `OrderSummary`, `OrderItem`, `OrderAddress` types to match the backend shape. Update all components that read these fields (`OrderDetailPage`, `OrderAddressCard`, `OrderItemsTable`, `OrderPaymentSummary`, `OrderTable`).

---

### GAP-011 — Variant type fields don't match backend response

**Feature/Module:** Products / Variants

**File:** `src/features/products/types/product.types.ts:33-46`

**Current frontend `ProductVariant` type vs actual backend** (`admin-api-contract.md §6.1`):

| Frontend | Backend | Notes |
|---|---|---|
| `name` | `variantName` | Different key |
| `price` | `basePrice` | Different key |
| `weight` | `weightGram` | Different key |
| `dimensions` | — | Field does not exist in backend |
| — | `compareAtPrice` | Missing from frontend type |
| `attributes: Record<string, string>` | `attributes: [{attributeName: string, value: string}][]` | Structure is completely different |

**Also:** `CreateVariantRequest` sends:
```ts
{ name, price, weight, dimensions, attributes: Record<string, string> }
```
But backend expects:
```ts
{ variantName, basePrice, salePrice, compareAtPrice, weightGram, sku, barcode, status,
  attributes: [{ attributeName, value }] }
```

**Fix needed:**
1. Update `ProductVariant` type to match backend field names.
2. Update `CreateVariantRequest`: rename `name→variantName`, `price→basePrice`, `weight→weightGram`; add `compareAtPrice`; remove `dimensions`; change `attributes` from `Record` to array.
3. Update `VariantForm`, `VariantTable`, `AttributeEditor`, `variantSchema` throughout.

---

### GAP-012 — Dashboard service uses wrong/non-existent endpoints

**Feature/Module:** Dashboard

**File:** `src/features/dashboard/services/dashboardService.ts`

Issues:
1. **Reviews path** (line 27, 47): Uses `/admin/reviews/pending` but backend endpoint is `GET /api/v1/reviews/pending` — **no `/admin` prefix** (`admin-api-contract.md §14.1`).
2. **Low stock** (lines 32, 52): Uses `/admin/inventories/reservations` with `maxAvailable: 5` filter. The reservations endpoint doesn't document a `maxAvailable` filter, and using reservations as a proxy for low stock is wrong — low-stock data requires the inventory stock endpoint, not the reservation list.
3. **Dashboard stats** (`GET /admin/orders` for order counts, `GET /admin/payments` for revenue): These work against real endpoints but the approach of fetching full pages just to read `totalItems` is fragile. No dedicated `/admin/dashboard/stats` endpoint exists in the current backend.

**Fix needed:**
1. Change `reviews/pending` calls to `/reviews/pending` (remove `/admin` prefix).
2. Replace low-stock approach — either use `GET /admin/inventories/warehouse/{warehouseId}` and filter client-side, or remove the low-stock panel until a proper endpoint exists.

---

### GAP-013 — Category list endpoint wrong; `CreateCategoryRequest` missing `parentId`

**Feature/Module:** Categories

**File:** `src/features/categories/services/categoryService.ts:11-12`, `src/features/categories/types/category.types.ts:21-25`

**Issues:**

**(a) List endpoint path:**
```ts
categoryService.getList(...) → GET /admin/categories  // assumed
```
Backend contract only documents:
- `GET /api/v1/categories` (public — list active categories)
- `GET /api/v1/categories/{id}` (public)

There is no documented `GET /api/v1/admin/categories` endpoint. The public endpoint may be sufficient for the admin list, but this must be verified. If the admin list needs draft/inactive categories, a separate admin endpoint may be required.

**(b) Missing `parentId` in create/update:**
```ts
// frontend CreateCategoryRequest:
{ name, slug, description, status }  // missing parentId
```
Backend contract (`admin-api-contract.md §3.3`) includes `parentId: long | null`.

**Fix needed:**
1. Verify whether `GET /admin/categories` exists or switch to `GET /categories`.
2. Add `parentId?: number | null` to `CreateCategoryRequest` and `CategoryForm`.

---

### GAP-014 — Shipment field names and non-existent events endpoint

**Feature/Module:** Shipments

**File:** `src/features/shipments/types/shipment.types.ts`, `src/features/shipments/services/shipmentService.ts:22`

**Issues:**

**(a) Field name mismatches** — backend contract (`admin-api-contract.md §10.1`) expects:
- `trackingNumber` (not `trackingCode`)
- `estimatedDeliveryDate` (not `estimatedDelivery`)

Frontend `CreateShipmentRequest`, `UpdateShipmentRequest`, `ShipmentSummary`, and `Shipment` all use `trackingCode` and `estimatedDelivery`.

**(b) Non-existent events endpoint:**
```ts
getEvents: (id: number) =>
  apiClient.get<ShipmentEvent[]>(`/admin/shipments/${id}/events`),
```
`GET /admin/shipments/{id}/events` is not in the API contract. The shipment status history (tracking events) is either embedded in `ShipmentResponse` or doesn't have a dedicated endpoint yet.

**Fix needed:**
1. Rename `trackingCode` → `trackingNumber` and `estimatedDelivery` → `estimatedDeliveryDate` in all shipment types, schema, and form components.
2. Remove `shipmentService.getEvents()` or verify if the endpoint exists. Remove `useShipmentEvents` hook and `ShipmentEventTimeline` component usage until confirmed.

---

## Medium Impact Issues

These issues produce incorrect data, wrong type safety, or silent failures.

---

### GAP-015 — `PromotionScope` enum has `ORDER` instead of `ALL`

**File:** `src/shared/types/enums.ts:95-101`

Frontend has `ORDER: 'ORDER'` but backend uses `ALL: 'ALL'` (`api-common.md §8`). The `PRODUCT` scope value is correct; `ORDER` is not a valid value.

**Fix:** Replace `ORDER: 'ORDER'` → `ALL: 'ALL'`.

---

### GAP-016 — `PaymentStatus` enum conflates order-level and payment-record-level statuses

**File:** `src/shared/types/enums.ts:14-22`

Frontend's single `PaymentStatus` enum includes values from two distinct backend enums:
- **Order payment status** (on `Order.paymentStatus`): `PENDING | PAID | FAILED | REFUNDED`
- **Payment record status** (on `Payment.status`): `PENDING | INITIATED | PAID | FAILED | REFUNDED | PARTIALLY_REFUNDED`

The frontend uses the same `PaymentStatus` type for both. `OrderSummary.paymentStatus` should only allow `PENDING | PAID | FAILED | REFUNDED`; using `INITIATED` or `PARTIALLY_REFUNDED` there is a type error that masks data bugs.

**Fix:** Create two separate types: `OrderPaymentStatus` (4 values) and `PaymentRecordStatus` (6 values). Apply them to the appropriate fields.

---

### GAP-017 — Warehouse type missing `code` field

**File:** `src/features/inventory/types/inventory.types.ts:7-13`

Backend response (`admin-api-contract.md §7.1`) includes `code: "WHM-001"` (warehouse code). Frontend `Warehouse` type and `CreateWarehouseRequest` have no `code` field. The warehouse code is a required business identifier.

**Fix:** Add `code: string` to `Warehouse` type and `CreateWarehouseRequest`. Update `WarehouseForm` and `WarehouseTable`.

---

### GAP-018 — `OrderListParams` missing `paymentStatus` filter

**File:** `src/features/orders/types/order.types.ts:93-100`

Backend `OrderAdminFilter` is noted as having `paymentStatus` among its filters (`admin-api-contract.md §8.1`). Frontend `OrderListParams` has `paymentMethod` and `status` but no `paymentStatus`. The filter panel can't filter by payment status.

**Fix:** Add `paymentStatus?: string` to `OrderListParams`.

---

### GAP-019 — Shipment list uses combined `sort` param; backend uses separate `sort` + `direction`

**File:** `src/features/shipments/types/shipment.types.ts:59-65`

`ShipmentListParams extends PaginationParams` which encodes sort as `sort: 'createdAt,desc'` (combined). But the shipment list endpoint (`admin-api-contract.md §10.4`) documents separate `sort` and `direction` params:
```
sort: string  — Default: createdAt
direction: string — asc | desc. Default: desc
```
This diverges from the other endpoints that use the combined Spring Pageable `sort=field,direction` format. Verify backend behaviour — if shipments truly use separate params, update `ShipmentListParams` and shipment-specific query builders. Same issue likely applies to invoices (`admin-api-contract.md §11.5`).

---

### GAP-020 — Category response missing `parentId` field

**File:** `src/features/categories/types/category.types.ts:4-13`

Frontend `Category` type has no `parentId` field. Backend response (`admin-api-contract.md §3.1`) includes `parentId: null | number`. Without this field, hierarchical category display (parent–child relationships) is impossible.

**Fix:** Add `parentId: number | null` to `Category` type.

---

### GAP-021 — `catalogService` returns paginated but is typed as list

**File:** `src/features/products/services/catalogService.ts`

```ts
getCategories: () =>
  apiClient.get<PaginatedResponse<CategoryOption>>('/categories', { params: { page: 0, size: 200 } }),
```

This is used in `useCatalogOptions` hooks to populate dropdowns. If GAP-001 is fixed (`PaginatedResponse.content` → `items`), all dropdown consumers that call `.content` will need to change to `.items`. No separate action beyond fixing GAP-001 is needed here, but usages must be updated.

---

### GAP-022 — `Product` list response shape vs paginated response assumed

**File:** `src/features/products/services/productService.ts:12-13`

```ts
getList: (params) =>
  apiClient.get<PaginatedResponse<Product>>('/admin/products', { params }),
```

Backend product list (`admin-api-contract.md §5.1`) returns a summary type (`ProductListItem`) with only `id, name, slug, status, featured, brand, createdAt` — not the full `Product` type (which is the detail shape). The frontend uses the full `Product` type for list items.

Additionally, `Product.variantCount`, `Product.activeVariantCount`, `Product.thumbnailUrl`, `Product.updatedAt` fields are present in the frontend type but **not documented** in the list response shape. These fields may or may not be returned.

**Fix:** Define a separate `ProductListItem` type matching the documented list shape. Update `productService.getList` return type and `ProductTable`.

---

### GAP-023 — `OrderActionPanel` allows `PROCESSING → CANCELLED` but backend forbids it

**File:** `src/features/orders/components/OrderActionPanel.tsx:76-96`

Frontend shows a "Cancel Order" button for orders in `PROCESSING` status. But the backend cancel endpoint (`admin-api-contract.md §8.8`) only accepts cancellation from `PENDING`, `AWAITING_PAYMENT`, `CONFIRMED`. Cancellation from `PROCESSING` will return 422 `ORDER_CANNOT_CANCEL`.

**Fix:** Remove the `CANCELLED` action from `STATUS_ACTIONS.PROCESSING`.

---

### GAP-024 — Products and variants are accessible to STAFF but API requires ADMIN/SUPER_ADMIN

**File:** `src/app/Router.tsx:82-88`

Product routes have no `RoleGuard`. According to `admin-api-contract.md §5`:
- All product and variant endpoints require `ADMIN` or `SUPER_ADMIN`.

STAFF users can navigate to product pages but all API calls will return 403. The server will reject them, but the frontend shows the pages anyway.

**Fix:** Wrap product and variant routes in `<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />`. Update the permissions map in `src/constants/permissions.ts` to reflect the actual backend permission for products.

---

### GAP-025 — `inventoryService.getReservations` endpoint is not documented

**File:** `src/features/inventory/services/inventoryService.ts:28-30`

```ts
getReservations: (params) =>
  apiClient.get<PaginatedResponse<Reservation>>('/admin/inventory/reservations', { params }),
```

`GET /admin/inventories/reservations` is **not documented** in the API contract. The contract documents `POST /admin/inventories/reserve` and `POST /admin/inventories/release` but no GET for reservations. The `ReservationListPage` will always 404.

**Fix:** Verify with backend team whether a reservations list endpoint exists or is planned. If not, remove or disable `ReservationListPage` and the associated route.

---

## Low Impact Issues

Minor enum additions, missing optional fields, low-usage paths.

---

### GAP-026 — `Shipment` and `Order` types missing `paymentCode` / `invoiceCode` cross-references

**File:** `src/features/orders/types/order.types.ts`, `src/features/shipments/types/shipment.types.ts`

The order detail response may include an associated `paymentCode` and shipment summary. The frontend `Order` type has `payment: OrderPayment | null` and `shipment: OrderShipment | null`, but those nested shapes don't fully match the backend's documented sub-fields (e.g., `paymentCode` is on the payment entity but not shown in `OrderPayment`).

**Impact:** Low — these are display-only fields used for cross-navigation links.

---

### GAP-027 — `StockAdjustmentReason` enum is entirely fictional

**File:** `src/shared/types/enums.ts:118-126`

```ts
export const StockAdjustmentReason = {
  DAMAGE: 'DAMAGE',
  RETURN: 'RETURN',
  CORRECTION: 'CORRECTION',
  OTHER: 'OTHER',
} as const;
```

This enum does not exist in the backend contract. It's used only in the now-incorrect `AdjustStockRequest.reason` field (see GAP-006). After GAP-006 is fixed (switching to `movementType`), this enum becomes unused.

**Fix:** Remove `StockAdjustmentReason` enum. Remove all references in `adjustStockSchema.ts` and `AdjustStockModal.tsx`.

---

### GAP-028 — `Warehouse` list endpoint may not be paginated

**File:** `src/features/inventory/services/warehouseService.ts:10-12`

```ts
getList: (params: WarehouseListParams) =>
  apiClient.get<PaginatedResponse<Warehouse>>('/admin/warehouses', { params }),
```

Backend contract (`admin-api-contract.md §7.1`) shows the warehouse list response as a plain array (`data: [ { id, name, code, address, status } ]`), not a paginated response. If the actual response is not paginated, treating it as `PaginatedResponse<Warehouse>` will fail.

**Fix:** After confirming the backend shape, either change return type to `Warehouse[]` or keep as paginated if the backend does paginate it.

---

## Summary Table

| ID | Module | File | Current Assumption | Actual Contract | Impact |
|---|---|---|---|---|---|
| GAP-001 | All lists | `api.types.ts:9` | `{content, totalElements, number}` | `{items, totalItems, page}` | Critical |
| GAP-002 | All forms | `api.types.ts:24` | `ApiError.fieldErrors` | `ApiError.errors` | Critical |
| GAP-003 | Orders | `orderService.ts:17` | `PATCH /orders/{id}/status` | Separate `POST /{id}/confirm`, `/process`, etc. | Critical |
| GAP-004 | Payments | `paymentService.ts:15` | `POST /payments/{id}/mark-paid` | `POST /payments/order/{orderId}/complete` | Critical |
| GAP-005 | Inventory | `inventoryService.ts` | `/admin/inventory/*` | `/admin/inventories/*` + no stock-list endpoint | Critical |
| GAP-006 | Inventory | `inventory.types.ts:57` | `reason: StockAdjustmentReason` | `movementType: IMPORT|EXPORT|ADJUSTMENT|RETURN` | Critical |
| GAP-007 | Products | `enums.ts:58` | `ARCHIVED` status | `INACTIVE` status | Critical |
| GAP-008 | Inventory | `enums.ts:67` | Wrong movement type values | `IMPORT|EXPORT|ADJUSTMENT|RETURN` | Critical |
| GAP-009 | Auth | `auth.types.ts:36` | `data.tokens.accessToken` | Likely flat `data.accessToken` | Critical |
| GAP-010 | Orders | `order.types.ts:58` | `code`, nested `customer`, `shippingAddress`, `total` | `orderCode`, `customerId`, flat shipping fields, `totalAmount` | High |
| GAP-011 | Products | `product.types.ts:33` | `name`, `price`, `weight`, `attributes: Record` | `variantName`, `basePrice`, `weightGram`, `attributes: []` | High |
| GAP-012 | Dashboard | `dashboardService.ts` | `/admin/reviews/pending`, `/inventories/reservations?maxAvailable=5` | `/reviews/pending`, no low-stock list | High |
| GAP-013 | Categories | `categoryService.ts:11` | `GET /admin/categories`; no parentId | `GET /categories`; parentId required | High |
| GAP-014 | Shipments | `shipment.types.ts` | `trackingCode`, `estimatedDelivery`; `/shipments/{id}/events` | `trackingNumber`, `estimatedDeliveryDate`; no events endpoint | High |
| GAP-015 | Promotions | `enums.ts:99` | `PromotionScope.ORDER` | `PromotionScope.ALL` | Medium |
| GAP-016 | Payments | `enums.ts:14` | Single PaymentStatus for both contexts | Two separate enums per context | Medium |
| GAP-017 | Inventory | `inventory.types.ts:7` | No `code` field | `code` field on Warehouse | Medium |
| GAP-018 | Orders | `order.types.ts:93` | No `paymentStatus` filter | `paymentStatus` is a documented filter | Medium |
| GAP-019 | Shipments | `shipment.types.ts:60` | `sort: 'field,direction'` | `sort` + `direction` separate params | Medium |
| GAP-020 | Categories | `category.types.ts:4` | No `parentId` on Category | `parentId` in response | Medium |
| GAP-021 | Products | `catalogService.ts` | `data.content` for dropdowns | `data.items` after GAP-001 fix | Medium |
| GAP-022 | Products | `productService.ts:12` | Full `Product` type for list | Summary type only | Medium |
| GAP-023 | Orders | `OrderActionPanel.tsx:76` | Cancel allowed from PROCESSING | Cancel only allowed: PENDING, AWAITING, CONFIRMED | Medium |
| GAP-024 | Products | `Router.tsx:82` | No RoleGuard on products | ADMIN/SUPER_ADMIN only | Medium |
| GAP-025 | Inventory | `inventoryService.ts:28` | `GET /inventories/reservations` | Endpoint not in contract | Medium |
| GAP-026 | Orders/Shipments | `order.types.ts` | Missing cross-reference codes | Minor field gaps | Low |
| GAP-027 | Inventory | `enums.ts:118` | `StockAdjustmentReason` enum | Doesn't exist in backend | Low |
| GAP-028 | Inventory | `warehouseService.ts:10` | Paginated warehouse list | Possibly plain array | Low |

---

## Fix Priority Order

1. **GAP-001** — Fix `PaginatedResponse` type (unblocks all list screens)
2. **GAP-002** — Fix `ApiError.errors` key (unblocks all form validation)
3. **GAP-009** — Verify and fix auth login response shape (unblocks login)
4. **GAP-003** — Rewrite order status transition service (separate POST endpoints)
5. **GAP-010** — Fix Order type field names (unblocks order detail/list)
6. **GAP-007** — Fix `ProductStatus.ARCHIVED` → `INACTIVE`
7. **GAP-004** — Fix payment mark-paid endpoint
8. **GAP-005 + GAP-006** — Rewrite inventory service (URL path + request body)
9. **GAP-011** — Fix variant field names
10. **GAP-008** — Fix `StockMovementType` enum values
11. **GAP-012** — Fix dashboard service endpoints
12. **GAP-014** — Fix shipment field names
13. **GAP-013** — Fix category list endpoint + add parentId
14. Remaining medium/low issues
