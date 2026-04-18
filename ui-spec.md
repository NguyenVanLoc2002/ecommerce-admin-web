# Admin UI/UX Specification — Fashion Shop Platform

> **Source**: Extracted from `ui-spec.md` (derived strictly from backend codebase).
> **Revised**: 2026-04-18
> **Backend Base URL**: `/api/v1`
> **Auth**: `Authorization: Bearer <accessToken>` on all protected endpoints.
> **Minimum role**: `STAFF`. Write operations noted with `ADMIN+` require `ADMIN` or `SUPER_ADMIN`.

---

## Table of Contents

1. [Admin Roles & Access Model](#1-admin-roles--access-model)
2. [Global UI Conventions](#2-global-ui-conventions)
3. [Admin — Flows & Screens](#3-admin--flows--screens)
   - [3.1 Dashboard](#31-dashboard)
   - [3.2 Product Management](#32-product-management)
   - [3.3 Category & Brand Management](#33-category--brand-management)
   - [3.4 Inventory & Warehouse Management](#34-inventory--warehouse-management)
   - [3.5 Order Management](#35-order-management)
   - [3.6 Payment Management](#36-payment-management)
   - [3.7 Shipment Management](#37-shipment-management)
   - [3.8 Invoice Management](#38-invoice-management)
   - [3.9 Promotion & Voucher Management](#39-promotion--voucher-management)
   - [3.10 Review Moderation](#310-review-moderation)
   - [3.11 Audit Log](#311-audit-log)
4. [State Machines Reference](#4-state-machines-reference)
5. [Admin Edge Cases & Race Conditions](#5-admin-edge-cases--race-conditions)
6. [Admin Error Codes Reference](#6-admin-error-codes-reference)

---

## 1. Admin Roles & Access Model

### 1.1 Role Hierarchy

```
SUPER_ADMIN
    └── ADMIN
            └── STAFF
```

Each higher role **inherits all permissions** of roles below it.

| Role | Description | Access |
|---|---|---|
| `STAFF` | Store staff | Admin panel — view + manage orders, shipments, reviews |
| `ADMIN` | Store admin | All STAFF + voucher/promotion write, product management |
| `SUPER_ADMIN` | Platform owner | All ADMIN + system config, actuator endpoints |

### 1.2 Admin Endpoint Access Matrix

| Pattern | STAFF+ | ADMIN+ | SUPER_ADMIN |
|---|---|---|---|
| `GET /admin/**` | ✅ | ✅ | ✅ |
| `POST /admin/orders/{id}/confirm` | ✅ | ✅ | ✅ |
| `POST /admin/orders/{id}/process` | ✅ | ✅ | ✅ |
| `POST /admin/orders/{id}/deliver` | ✅ | ✅ | ✅ |
| `POST /admin/orders/{id}/complete` | ✅ | ✅ | ✅ |
| `POST/PATCH/DELETE /admin/products/**` | ✅ | ✅ | ✅ |
| `POST/PATCH/DELETE /admin/categories/**` | ✅ | ✅ | ✅ |
| `POST/PATCH/DELETE /admin/brands/**` | ✅ | ✅ | ✅ |
| `POST/PATCH/DELETE /admin/shipments/**` | ✅ | ✅ | ✅ |
| `POST/PATCH /admin/payments/**` | ✅ | ✅ | ✅ |
| `PATCH /admin/reviews/{id}/moderate` | ✅ | ✅ | ✅ |
| `POST/PATCH/DELETE /admin/vouchers/**` | — | ✅ | ✅ |
| `POST/PATCH/DELETE /admin/promotions/**` | — | ✅ | ✅ |
| `/actuator/**` (sensitive) | — | — | ✅ |

**Role-gated write actions** (`ADMIN+` only) must be **disabled** (greyed, tooltip "Requires Admin role") for `STAFF` users — not hidden.

---

## 2. Global UI Conventions

### 2.1 Response Wrapper

```json
// Success
{ "success": true, "code": "SUCCESS", "message": "...", "data": { ... }, "timestamp": "..." }

// Error
{ "success": false, "code": "ORDER_NOT_FOUND", "message": "...", "path": "...", "timestamp": "...", "fieldErrors": [] }
```

### 2.2 Pagination Parameters

| Param | Type | Default |
|---|---|---|
| `page` | int | 0 (zero-based) |
| `size` | int | 20 |
| `sort` | string | `createdAt,desc` |

Response includes `totalElements`, `totalPages`, `number`, `size`.

---

### 2.3 Skeleton Variants

| Skeleton Type | Used For |
|---|---|
| `skeleton-table` | All admin list screens |
| `skeleton-detail` | Order detail, product detail, payment detail |
| `skeleton-form` | Create/edit product, shipment form |
| `skeleton-timeline` | Shipment events, audit log |
| `skeleton-stat` | Dashboard KPI cards |

**Rules**:
- Show skeleton on **initial load** and on **hard refresh** of a route.
- Show **spinner** (not skeleton) on subsequent user-triggered actions (button clicks, filter changes).
- Never show both skeleton and real content simultaneously.
- Animate skeletons with a left-to-right shimmer.

---

### 2.4 Toast / Alert System

| Type | Trigger | Auto-dismiss |
|---|---|---|
| **Success** (green) | Mutation completed (save, confirm, approve) | 4 s |
| **Error** (red) | API error on mutation | No — requires manual dismiss |
| **Warning** (amber) | Soft warning (e.g., publishing product with no variants) | 6 s |
| **Info** (blue) | Neutral status update | 4 s |

**Rules**:
- Maximum 3 toasts visible at once; queue subsequent ones.
- Errors from `fieldErrors` array go **inline** (not toast).
- Network timeout errors always include a **Retry** action in the toast.

---

### 2.5 Confirmation Dialogs

All destructive or irreversible actions require a confirmation dialog before calling the API.

| Action | Dialog Title | Confirm Label | Style |
|---|---|---|---|
| Delete product (soft) | "Remove product?" | "Remove" | Destructive (red) |
| Delete variant | "Delete variant?" | "Delete" | Destructive |
| Void invoice | "Void this invoice?" + reason textarea | "Void invoice" | Destructive |
| Soft-delete voucher | "Deactivate voucher?" | "Deactivate" | Destructive |
| Reject review | "Reject this review?" + note textarea (required) | "Reject" | Destructive |
| Delete category/brand | "Delete this {entity}?" | "Delete" | Destructive |
| Bulk approve reviews | "Approve {n} reviews?" | "Approve all" | Warning |

**Rules**:
- Confirmation button is disabled until any required input (e.g., rejection note) is filled.
- Cancel (dismiss) is always the leftmost / less prominent button.
- Pressing Escape closes the dialog without action.

---

### 2.6 Form State Management

- Track dirty state on all forms (any field modified from server value).
- On route navigation away from a dirty form: show browser-native "Leave page?" prompt or a custom modal.
- On successful save: clear dirty flag; do not prompt on next navigation.
- On validation error (422): keep form open with inline errors; do not navigate away.
- Auto-save (drafts) is **out of scope for Phase 1** — forms require explicit save.

---

### 2.7 HTTP Layer Patterns

#### Token Refresh Interceptor

```
Request →
  attach Authorization header →
    if 401 response:
      call POST /auth/refresh-token with refreshToken
        if refresh succeeds:
          store new tokens
          retry original request once
        if refresh fails (401 again):
          clear all tokens
          redirect to /login with ?redirect=<current-path>
          show toast: "Session expired. Please sign in again."
```

- The interceptor handles **all** 401s transparently.
- Implement request queue: if a token refresh is already in-flight, queue subsequent 401ed requests and replay them all after refresh.

#### Network Retry

- Retry **GET** requests up to **2 times** with 1 s delay on network failure.
- Do **not** auto-retry **POST/PATCH/DELETE** — mutations must be user-triggered to avoid double-submit.
- After 2 failed GETs: show inline error with a manual "Retry" button.

#### Search / Filter Debounce

- Debounce keyword search inputs: **300 ms** before firing the API request.
- Debounce numeric filter inputs: **500 ms**.
- Show a spinner inside the search input field while the debounced request is in-flight.

---

### 2.8 Common UI States (every screen)

| State | Trigger | UI Behaviour |
|---|---|---|
| **Initial load** | First render | Appropriate skeleton variant (§2.3) |
| **Action loading** | Button-triggered mutation | Button shows spinner, label changes to "Saving…"; button disabled |
| **Empty** | `data = []` or `data = null` | Illustrated empty state with contextual CTA |
| **Error** | Non-2xx or network failure on GET | Inline error card with message + "Retry" button |
| **Validation error** | 422 `fieldErrors` | Inline per-field message below input; red border on field |
| **Forbidden** | 403 | "You don't have permission to view this." with back button |
| **Unauthorised** | 401 (after refresh fails) | Interceptor clears tokens → redirect to login |
| **Not found** | 404 on detail page | Dedicated 404 illustration + "Go back" link |
| **Server error** | 500 | Toast: "Something went wrong. Please try again." |
| **Stale data** | `ORDER_STATUS_INVALID` or similar concurrency error | Toast: "This record was updated. Refreshing…" + auto-reload |

---

### 2.9 Money Formatting

- All money is `DECIMAL(18,2)`. Display with locale currency symbol, two decimal places.
- **Never compute** discounts, totals, or line totals client-side — display values as returned by API.
- Zero discount: hide the discount row entirely.

### 2.10 Business Code Display

Monospace font, copy-to-clipboard icon on hover.

| Entity | Example |
|---|---|
| Order | `ORD202604060001` |
| Payment | `PAY...` |
| Invoice | `INV...` |
| Shipment | `SHP...` |

---

### 2.11 Admin Table UX (Standard Pattern)

Applied to **every** admin list screen. Reference this section rather than repeating it.

#### Toolbar layout

```
[ Search input            ] [ Filter ▾ ] [ Columns ▾ ]     [ + New ]
[ Active filter chips × × × ]                       [ Reset filters ]
────────────────────────────────────────────────────────────────────
[ ☐ ] Col A ↕  Col B ↕  Col C ↕  ...                      Actions
────────────────────────────────────────────────────────────────────
  Showing 1–20 of 347 results                [ < 1 2 3 … 18 > ] [20 ▾]
```

#### Features

**Sorting**: Click column header to sort ascending; click again for descending. Active sort shows `↑`/`↓` arrow. One sort at a time.

**Filtering**:
- Filter panel opens as a side drawer or dropdown.
- Active filters shown as dismissible chips below the toolbar.
- "Reset filters" button clears all active filters and re-runs query.
- Filter state persisted in URL query params so browser back/forward works.

**Page size selector**: Options 10 / 20 / 50 / 100. Default 20. Persisted in localStorage.

**Results count**: "Showing {from}–{to} of {totalElements} results". Updates on filter/sort/page change.

**Column visibility toggle**: Dropdown of checkboxes. At least one column always visible.

**Row actions**:
- Primary action visible on row hover (e.g., "View").
- Secondary actions in a `⋯` kebab menu.
- Destructive actions in kebab only (never prominent).

**Bulk actions**:
- Checkbox in each row + header checkbox (select all on page).
- Bulk action bar appears above table when ≥ 1 row selected: "X selected | [Action A] [Action B] [Deselect all]".
- Bulk actions require confirmation dialog before execution.
- After bulk action: refresh table; deselect all; show toast with count ("3 orders confirmed").

**Empty state** (no results): illustration + "No {entity} found" + "Clear filters" if filters are active, or "Create your first {entity}" if no data at all.

**Loading state**: `skeleton-table` on initial load; spinner in table body on filter/sort/page change (keep headers visible).

**Error state**: Inline error card inside table area with "Retry" button.

---

## 3. Admin — Flows & Screens

> All admin screens require `STAFF`/`ADMIN`/`SUPER_ADMIN`.
> All admin list screens implement the **standard table UX** from §2.11.
> Role-gated write actions (`ADMIN` only) are disabled (greyed, tooltip "Requires Admin role") for `STAFF` users.

---

### 3.1 Dashboard

#### Screen: Admin Dashboard

**Purpose**: KPI overview + actionable queues.

**Layout**: 2-column grid (KPI cards top) + 2-column panels (recent orders / queues bottom).

**KPI Cards** (assembled from standard API endpoints with filters):

| Card | API | Filter |
|---|---|---|
| Orders today | `GET /admin/orders` | `createdAt=today` |
| Revenue today | `GET /admin/payments` | `status=PAID&paidAt=today` |
| Pending confirmation | `GET /admin/orders` | `status=PENDING,AWAITING_PAYMENT` |
| Pending reviews | `GET /admin/reviews/pending` | — |
| Low stock variants | `GET /admin/inventories/reservations` | `available≤5` |
| Shipments out for delivery | `GET /admin/shipments` | `status=OUT_FOR_DELIVERY` |

**Panels**:
- Recent orders (last 10): order code, customer, status, amount, "Confirm" quick-action if PENDING
- Pending reviews queue: product name, rating, customer, "Approve" / "Reject" inline buttons
- Low stock alerts: variant name, SKU, warehouse, available count, "Import Stock" link

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-stat` × 6 + `skeleton-table` × 2 |
| API error on any card | Card shows "—" with refresh icon |

**Business rules**:
- No dedicated dashboard API — aggregate from standard endpoints.
- KPI cards are informational only; tapping navigates to the respective filtered list screen.

---

### 3.2 Product Management

#### Product Lifecycle (Admin)

```
DRAFT ──[Publish]──▶ PUBLISHED ──[Archive]──▶ ARCHIVED
  ▲                     │
  └────[Revert draft]───┘ (if no active orders)
```

Only `PUBLISHED` products appear to customers. `ARCHIVED` products are visible in admin only.

---

#### Screen: Admin Product List

**Standard table UX** (§2.11) plus:

**Columns**: Thumbnail | Name | Brand | Categories | Status | Variant count | Created | Actions

**Filters**: Status (multi: DRAFT/PUBLISHED/ARCHIVED), Category, Brand, Featured (yes/no)

**Sort**: Name, Created date, Updated date

**Bulk actions**:
- "Publish selected" — sets status to `PUBLISHED` for all selected DRAFT items
- "Archive selected" — sets status to `ARCHIVED` for all selected PUBLISHED items
- "Delete selected" — soft-delete with confirmation dialog

**Row actions** (kebab):
- Edit, View (public), Manage Variants, Delete

**API**:
```
GET    /api/v1/admin/products?page=0&size=20&status={}&categoryId={}&brandId={}&keyword={}
PATCH  /api/v1/admin/products/{id}
DELETE /api/v1/admin/products/{id}
```

---

#### Screen: Create / Edit Product

**Components**:
- Product name (required, unique; slug auto-generated, editable)
- Brand select
- Categories multi-select
- Short description (textarea, max 300 chars)
- Full description (rich text editor)
- Status select: DRAFT / PUBLISHED / ARCHIVED
- Featured toggle
- "Save" button; "Save & Publish" shortcut button (sets status=PUBLISHED then saves)
- Unsaved changes guard (§2.6)

**Warning banner** (client-side check):
- If setting `status = PUBLISHED` and product has 0 active variants: amber warning "This product has no active variants. Customers will not be able to purchase it."
- Allow publish anyway (server does not block this).

**API**:
```
POST  /api/v1/admin/products
PATCH /api/v1/admin/products/{id}
Body: { name, slug, brandId, categoryIds, shortDescription, description, status, featured }
DELETE /api/v1/admin/products/{id}
```

**States**:

| State | UI |
|---|---|
| Loading (edit) | `skeleton-form` |
| Name/slug conflict (409) | Field error: "A product with this name/slug already exists" |
| Saving | Button spinner |
| Save success (create) | Navigate to product edit page with success toast |
| Save success (edit) | Toast: "Product saved"; stay on page |

---

#### Screen: Variant Management (sub-panel)

**Components**:
- Variant table: SKU | Name | Price | Sale Price | Status | Actions
- Inline "Add Variant" form (toggle open/closed)
- Edit variant: inline row edit or modal
- Delete variant: confirmation dialog

**Variant form fields**:
- SKU (required, globally unique)
- Variant name (required)
- Price (`DECIMAL(18,2)`, required, > 0)
- Sale price (optional; client validates `salePrice ≤ price`)
- Weight, dimensions (optional)
- Status: ACTIVE / INACTIVE
- Attributes: dynamic key-value pairs (Color=White, Size=M)

**States**:

| State | UI |
|---|---|
| SKU conflict (409) | Field error: "This SKU is already in use" |
| `salePrice > price` (client) | Field error: "Sale price must not exceed regular price" |
| Delete with active reservations (409/422) | Error: "Cannot delete variant with active inventory reservations" |

**Business rules**:
- `INACTIVE` variant hidden from customer product detail.
- SKU globally unique across all products/variants.

---

### 3.3 Category & Brand Management

Both screens follow the same pattern; documented together.

**Standard table UX** (§2.11).

**Category columns**: Name | Slug | Status | Created | Actions
**Brand columns**: Name | Slug | Status | Created | Actions

**Inline create/edit modal** (not a full page):
- Name (required), Slug (auto-generated, editable), Status (ACTIVE/INACTIVE)
- Brand-only: Logo URL field

**Soft-delete**: confirmation dialog; shows "This will hide the {category/brand} from all listings."

**API**:
```
GET    /api/v1/categories | /api/v1/brands
POST   /api/v1/admin/categories | /api/v1/admin/brands
PATCH  /api/v1/admin/categories/{id} | /api/v1/admin/brands/{id}
DELETE /api/v1/admin/categories/{id} | /api/v1/admin/brands/{id}
```

---

### 3.4 Inventory & Warehouse Management

#### Warehouse Screen

**Standard table UX** (§2.11).

**Columns**: Name | Location | Status | Created | Actions

**Inline create/edit modal**: Name (required), Location (required), Status toggle.

**API**:
```
GET    /api/v1/admin/warehouses
POST   /api/v1/admin/warehouses
PATCH  /api/v1/admin/warehouses/{id}
DELETE /api/v1/admin/warehouses/{id}
```

---

#### Screen: Inventory by Variant

**Components**:
- Product → Variant selector (cascade: select product first, then variant)
- Inventory grid (one row per warehouse):

| Warehouse | On Hand | Reserved | Available | Actions |
|---|---|---|---|---|
| Main WH | 50 | 8 | **42** | Import / Adjust |

  - `available = onHand - reserved` — computed display, never persisted
  - Available < 5: highlight red; Available 5–20: highlight amber
- Import Stock modal:
  - Quantity (positive int, required)
  - Note (optional)
  - Confirm button
- Adjust Stock modal:
  - Delta (positive = increase, negative = decrease)
  - Reason (required, select: DAMAGE / RETURN / CORRECTION / OTHER)
  - Note (optional)
  - Confirm button — disabled if `onHand + delta < reserved`
- Stock Movements tab (paginated log)

**Stock Movements table**: Date | Type | Qty | Warehouse | Order ref | Admin | Note

**API**:
```
GET  /api/v1/admin/inventories/variant/{variantId}
POST /api/v1/admin/inventories/import   Body: { variantId, warehouseId, quantity, note }
POST /api/v1/admin/inventories/adjust   Body: { variantId, warehouseId, quantityDelta, reason }
GET  /api/v1/admin/inventories/stock-movements?variantId={}&warehouseId={}&page=0&size=20
```

**States**:

| State | UI |
|---|---|
| No variant selected | Empty state: "Select a product and variant to view inventory" |
| Import success | Toast: "Stock imported"; refresh inventory grid |
| Adjust — would go below reserved | Confirm button disabled; inline: "Cannot reduce below {reserved} reserved units" |
| `INVENTORY_NOT_ENOUGH` (server) | Toast error |

**StockMovementType labels**:

| Type | Label | Icon |
|---|---|---|
| `IMPORT` | Stock Received | ↓ green |
| `ADJUSTMENT` | Manual Adjustment | ↺ grey |
| `RESERVATION` | Reserved for Order | 🔒 amber |
| `RELEASE` | Reservation Released | 🔓 blue |
| `FULFILLMENT` | Order Fulfilled | ✓ green |

---

#### Screen: Inventory Reservations

**Standard table UX** (§2.11) + filter by status (ACTIVE / RELEASED).

**Columns**: Variant | SKU | Warehouse | Qty | Order code (link) | Status | Created

**API**:
```
GET /api/v1/admin/inventories/reservations?page=0&size=20&status={}
```

**Business rules**:
- `reserved` column is modified only by order creation (increase) and order cancellation (decrease).
- Admin cannot directly edit reservations — read-only screen.

---

### 3.5 Order Management

#### Admin Order Lifecycle — Swimlane

```
         Customer              System (auto)           Admin
────────────────────────────────────────────────────────────────
Places order ──────────────────────────────────────▶ PENDING
                                                         │
[ONLINE] Initiates payment ──────────────────▶ AWAITING_PAYMENT
                                                         │
Cancels order (if PENDING/AWAITING) ─────────▶ CANCELLED ◀── terminal
                                                         │
                                              Admin confirms ▶ CONFIRMED
                                                         │
                                            Admin processes ▶ PROCESSING
                                                         │
                               Admin creates shipment ──▶ SHIPPED (auto)
                                                         │
                        Admin sets shipment DELIVERED ──▶ DELIVERED (auto)
                                                         │
                                            Admin completes ▶ COMPLETED
                                                         │
                             Customer writes reviews now  │
────────────────────────────────────────────────────────────────
```

---

#### Screen: Admin Order List

**Standard table UX** (§2.11) plus:

**Columns**: Order Code | Customer | Status | Payment Method | Payment Status | Total | Date | Actions

**Filters**: Status (multi-select), Payment Method (COD/ONLINE), Payment Status, Date range (from/to)

**Search**: by order code, customer name, customer email

**Sort**: created date, total amount

**Bulk actions**:
- "Confirm selected" — bulk `POST /confirm` for `PENDING`/`AWAITING_PAYMENT` orders
- Confirmation dialog: "Confirm {n} orders?"
- After bulk confirm: refresh table; toast "3 orders confirmed"

**Row quick actions**:
- "Confirm" button (inline, visible only if status = PENDING or AWAITING_PAYMENT)
- "Process" button (inline, visible only if status = CONFIRMED)
- "View" link

**API**:
```
GET  /api/v1/admin/orders?page=0&size=20&status={}&paymentMethod={}&...
GET  /api/v1/admin/orders/code/{orderCode}
POST /api/v1/admin/orders/{id}/confirm
POST /api/v1/admin/orders/{id}/process
```

---

#### Screen: Admin Order Detail

**Components**:
- Status stepper with admin-action labels:
  ```
  Placed → Confirmed → Processing → Shipped → Delivered → Completed
  ```
  - Completed stages: filled green circle + checkmark
  - Current stage: pulsing blue circle
  - Future stages: empty grey circle
  - Cancelled/Refunded: stepper replaced by banner
- Order code + placed date
- Items table: product name, variant name, SKU, unit price, qty, line total (all snapshot data)
- Pricing breakdown: subtotal, voucher discount, shipping fee, **total** (bold)
- Delivery address snapshot (name, phone, street, ward, district, city)
- Payment summary: method, status badge, amount, paidAt
- Shipment mini-card: carrier, tracking number (copy icon), estimated delivery, current status → "View Shipment" link
- Invoice link (opens invoice screen)
- Admin note textarea (editable inline)
- **Action button panel** (dynamic per status):

| Status | Primary Button | Secondary |
|---|---|---|
| `PENDING` | "Confirm Order" (blue) | — |
| `AWAITING_PAYMENT` | "Confirm Order" (blue) | — |
| `CONFIRMED` | "Mark as Processing" (blue) | — |
| `PROCESSING` | "Create Shipment" (blue → opens shipment form) | — |
| `SHIPPED` | *(no button — driven by shipment status update)* | "View Shipment" |
| `DELIVERED` | "Mark as Completed" (green) | — |
| `COMPLETED` | *(no actions)* | — |
| `CANCELLED` | *(terminal — no actions)* | — |

**API**:
```
GET  /api/v1/admin/orders/{id}
POST /api/v1/admin/orders/{id}/confirm
POST /api/v1/admin/orders/{id}/process
POST /api/v1/admin/orders/{id}/deliver
POST /api/v1/admin/orders/{id}/complete
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-detail` |
| Action — loading | Button spinner + "Updating…" |
| `ORDER_STATUS_INVALID` (concurrency) | Toast: "Order status changed by another user. Refreshing…" + auto-reload after 1 s |
| Transition success | Status stepper advances; action buttons update; toast: "Order confirmed" |

**Edge cases**:
- Two admins confirming the same order simultaneously: second confirm returns `ORDER_STATUS_INVALID`; show stale-data toast and reload.
- Admin tries "Create Shipment" but order is already `SHIPPED` (another admin created shipment): same stale-data toast.

**Business rules**:
- Admin cannot cancel orders — cancellation is customer-initiated only.
- `DELIVERED` transition is driven automatically by shipment status update; "Mark Delivered" button is a fallback only.
- `COMPLETED` enables the customer's "Write a Review" button.
- All item data from immutable `OrderItem` snapshots — values never change post-creation.

---

### 3.6 Payment Management

#### Screen: Admin Payment List

**Standard table UX** (§2.11).

**Columns**: Payment Code | Order Code | Customer | Method | Status | Amount | Paid At | Actions

**Filters**: Method (COD/ONLINE), Status (multi-select), Date range

**Search**: payment code, order code, customer name

**Row actions**: View | Mark as Paid (COD + PENDING only)

**API**:
```
GET /api/v1/admin/payments?page=0&size=20&method={}&status={}
```

---

#### Screen: Admin Payment Detail

**Components**:
- Payment code, order link, method, status badge, amount, paidAt
- **"Mark as Paid" button** — shown only when `method = COD` AND `status = PENDING`
  - Confirmation dialog: "Mark this COD payment as paid?"
  - On confirm: `POST /admin/payments/order/{orderId}/complete`
- Transaction History table (immutable, read-only):

**Transaction columns**: Code | Status | Amount | Method | Provider | Provider Tx ID | Reference | Note | Created By | Created At

**API**:
```
GET  /api/v1/admin/payments/{id}
GET  /api/v1/admin/payments/{id}/transactions
POST /api/v1/admin/payments/order/{orderId}/complete
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-detail` |
| Mark paid — loading | Button spinner |
| `PAYMENT_ALREADY_PROCESSED` (409) | Toast: "This payment has already been processed" |
| Mark paid success | Status badge → PAID; button disappears; toast: "Payment marked as paid" |

**Business rules**:
- `PaymentTransaction` records are immutable — no edit/delete in UI.
- Online payments cannot be manually marked PAID — admin button only shows for COD.

---

### 3.7 Shipment Management

#### Shipment Status Machine — Admin Controls

```
PENDING ──[Mark In Transit]──▶ IN_TRANSIT ──[Mark Out for Delivery]──▶ OUT_FOR_DELIVERY
   │                                │                                          │
   └──[Fail]──▶ FAILED              └──[Fail]──▶ FAILED                       ├──[Fail]──▶ FAILED
                   │                                                           │
                   └──▶ RETURNED (terminal)                    [Mark Delivered]▼
                                                               DELIVERED (terminal)
                                                               ↓ auto: Order → DELIVERED
```

---

#### Screen: Admin Shipment List

**Standard table UX** (§2.11).

**Columns**: Code | Order Code | Carrier | Tracking | Status | Est. Delivery | Created | Actions

**Filters**: Status (multi), Carrier, Date range

**Row actions**: View | Update Status

**API**:
```
GET /api/v1/admin/shipments?page=0&size=20&status={}
```

---

#### Screen: Create Shipment

**Components**:
- Order selector (pre-filled from order detail; shows order code + customer name)
- Carrier (required, text input)
- Tracking number (text input; copy icon after save)
- Estimated delivery date (date picker; must be ≥ today)
- Shipping fee (`DECIMAL(18,2)`)
- Note (textarea)
- "Create Shipment" button

**API**:
```
POST /api/v1/admin/shipments
Body: { orderId, carrier, trackingNumber, estimatedDeliveryDate, shippingFee, note }
```

**States**:

| State | UI |
|---|---|
| Submitting | Button spinner + "Creating…" |
| `ORDER_NOT_FOUND` | Field error on order: "Order not found" |
| `ORDER_STATUS_INVALID` | Error: "Order must be in PROCESSING state to create a shipment" |
| Shipment already exists (409/conflict) | Error: "A shipment already exists for this order" |
| Success | Navigate to Shipment Detail; toast: "Shipment created — order is now SHIPPED" |

---

#### Screen: Admin Shipment Detail

**Components**:
- Shipment code, order link, carrier, tracking number (copy icon)
- Status badge
- Estimated delivery date; `deliveredAt` (if DELIVERED)
- Shipping fee + note
- "Edit Shipment" button → modal (update carrier, tracking, estimate — does not change status)
- **Status Update panel** (hidden when terminal):
  - Current status label
  - "Update Status" button → modal:
    - Status select (only valid next states, others disabled with tooltip "Not a valid transition")
    - Location (text, optional)
    - Description (text, optional)
    - Event time (datetime picker, defaults to now)
    - Confirm button
- Event Timeline (immutable, append-only): each entry shows status label + location + description + timestamp

**API**:
```
GET   /api/v1/admin/shipments/{id}
PATCH /api/v1/admin/shipments/{id}
PATCH /api/v1/admin/shipments/{id}/status
Body: { status, location, description, eventTime }
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-detail` |
| Terminal status (DELIVERED / RETURNED) | Status Update panel hidden; "No further updates available" note |
| Status update — loading | Button spinner |
| Status update success | Timeline appends new event; status badge updates; if DELIVERED: toast "Order automatically marked as DELIVERED" |
| `ORDER_STATUS_INVALID` (auto-transition conflict) | Toast: "Order status updated by another user. Refresh to see current state." |

**Valid next-state map** (drives the status select dropdown):

| Current | Valid next states |
|---|---|
| `PENDING` | `IN_TRANSIT`, `FAILED` |
| `IN_TRANSIT` | `OUT_FOR_DELIVERY`, `FAILED` |
| `OUT_FOR_DELIVERY` | `DELIVERED`, `FAILED` |
| `FAILED` | `RETURNED` |
| `DELIVERED` | *(none — terminal)* |
| `RETURNED` | *(none — terminal)* |

---

### 3.8 Invoice Management

#### Screen: Admin Invoice (per Order)

**Components**:
- Invoice header: code, issued date, due date
- Status badge: `ISSUED` (blue) / `PAID` (green) / `VOIDED` (red)
- `VOIDED` watermark overlay on all content
- Customer snapshot: name, email, phone (immutable)
- Billing address snapshot (immutable)
- Line items: product name, variant, SKU, qty, unit price, line total
- Pricing: subtotal, discount (voucher code), shipping fee, **total**
- **Admin status action panel** (hidden when terminal):
  - "Mark as Paid" button (ISSUED → PAID) — visible only when `status = ISSUED`
  - "Void Invoice" button (ISSUED → VOIDED) — visible only when `status = ISSUED`; requires confirmation dialog with mandatory note field

**API**:
```
POST  /api/v1/admin/invoices              Body: { orderId }   (manual fallback)
GET   /api/v1/admin/invoices/{id}
PATCH /api/v1/admin/invoices/{id}/status  Body: { status: "PAID"|"VOIDED", note }
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-detail` |
| `VOIDED` | "VOIDED" watermark; all action buttons hidden |
| `PAID` | "PAID" stamp; all action buttons hidden |
| Void — loading | Button spinner; overlay on content |
| Void success | Toast: "Invoice voided"; VOIDED watermark appears |

**Business rules**:
- Invoice data is a snapshot taken at order creation — never changes.
- Invoice auto-generated at order creation; manual `POST /admin/invoices` is a fallback only.

---

### 3.9 Promotion & Voucher Management

> Write operations (`POST`/`PATCH`/`DELETE`) require `ADMIN+`. STAFF sees read-only views.

#### Screen: Promotion List

**Standard table UX** (§2.11).

**Columns**: Name | Scope | Discount | Usage | Date Range | Active | Actions

**Filters**: Active status, Scope, Discount type

**Row actions**: View/Edit (ADMIN), Delete (ADMIN)

**API**:
```
GET /api/v1/admin/promotions?page=0&size=20
```

---

#### Screen: Create / Edit Promotion

**Components**:
- Name (required), Description
- Discount type: `PERCENTAGE` | `FIXED_AMOUNT`
- Discount value:
  - PERCENTAGE: number input 0–100; client validates range
  - FIXED_AMOUNT: decimal input > 0
- Max discount amount (PERCENTAGE only; optional cap)
- Minimum order amount (optional)
- Scope: ORDER | PRODUCT | CATEGORY | BRAND
- Start date + End date (date-time pickers; end > start)
- Usage limit (blank = unlimited)
- Active toggle
- **Rules section**:
  - Rule list with Type | Value | Description
  - "Add Rule" → inline form:
    - Type: `MIN_ORDER_AMOUNT` | `SPECIFIC_PRODUCTS` | `SPECIFIC_CATEGORIES` | `SPECIFIC_BRANDS` | `FIRST_ORDER`
    - Value: comma-separated IDs (SPECIFIC_*) or amount (MIN_ORDER_AMOUNT) or empty (FIRST_ORDER)
    - Description
  - Delete rule button (with confirmation)

**API**:
```
POST  /api/v1/admin/promotions
PATCH /api/v1/admin/promotions/{id}
DELETE /api/v1/admin/promotions/{id}
POST  /api/v1/admin/promotions/{id}/rules
PATCH /api/v1/admin/promotions/{id}/rules/{ruleId}
DELETE /api/v1/admin/promotions/{id}/rules/{ruleId}
```

**States**:

| State | UI |
|---|---|
| PERCENTAGE > 100 (client) | Field error: "Discount percentage must be between 0 and 100" |
| End before start (client) | Field error: "End date must be after start date" |
| Saving | Button spinner |

---

#### Screen: Voucher List

**Standard table UX** (§2.11).

**Columns**: Code | Promotion | Usage (used/limit) | Per-User Limit | Date Range | Active | Actions

**Filters**: Active, Promotion, Date range (active/expired)

**Search**: by code

**Row actions**: View (STAFF+), Edit (ADMIN), Delete (ADMIN), View Usages

**API**:
```
GET /api/v1/admin/vouchers?page=0&size=20
```

---

#### Screen: Create / Edit Voucher

**Components**:
- Code (required, unique; "Generate" button auto-creates random code)
- Linked promotion (required — select from active promotions)
- Usage limit (blank = unlimited; positive int)
- Per-user usage limit (blank = unlimited; positive int)
- Start date + End date
- Active toggle

**API**:
```
POST  /api/v1/admin/vouchers
PATCH /api/v1/admin/vouchers/{id}
DELETE /api/v1/admin/vouchers/{id}
```

---

#### Screen: Voucher Usage History

**Standard table UX** (§2.11, read-only).

**Header**: Voucher code, promotion name, total usages used / limit.

**Columns**: Customer ID | Order Code | Discount Amount | Used At

**API**:
```
GET /api/v1/admin/vouchers/{id}/usages?page=0&size=20
```

---

### 3.10 Review Moderation

#### Screen: Review Moderation Queue

**Standard table UX** (§2.11) plus:

**Layout option**: Dual-pane (list left, review detail right) for faster throughput.

**Columns**: Product | Customer | Rating | Snippet | Submitted | Status | Actions

**Filters**: Status (PENDING / APPROVED / REJECTED)

**Sort**: Submitted date (default: oldest first — process in order)

**Bulk actions**:
- "Approve selected" (bulk approve PENDING reviews)
- No bulk reject — rejection requires a per-review note

**Row actions** (and keyboard shortcuts when review is focused):
- "Approve" — green button (keyboard: `A`)
- "Reject" — red button → modal with required note (keyboard: `R` → opens modal)

**Reject modal**:
- Moderation note textarea (required, min 10 chars)
- "Reject Review" button (disabled until note filled)
- "Cancel" button

**API**:
```
GET   /api/v1/admin/reviews/pending?page=0&size=20
GET   /api/v1/admin/reviews/{id}
PATCH /api/v1/admin/reviews/{id}/moderate
Body: { status: "APPROVED"|"REJECTED", moderationNote }
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-table` |
| Empty (PENDING) | "No reviews pending — you're all caught up!" |
| Approve — loading | Row spinner; disable both buttons |
| Approve success | Remove row from PENDING list; toast: "Review approved" + customer notified |
| Reject success | Remove row from PENDING list; toast: "Review rejected" |

**Business rules**:
- `moderationNote` is **required** on rejection — visible to customer in My Reviews.
- Moderation action triggers `REVIEW_MODERATED` notification to customer (server-side).
- Bulk approve sends individual requests per review; show progress bar for large batches.

---

### 3.11 Audit Log

#### Screen: Audit Log

**Standard table UX** (§2.11, read-only — no bulk actions, no create button).

**Columns**: Timestamp | Admin | Action | Entity Type | Entity ID | IP Address | Changes

**Filters**: Action type (multi-select from `AuditAction` enum), Entity type, Admin user, Date range

**Sort**: Timestamp (default: newest first)

**Changes column**: collapsed JSON diff ("2 fields changed") → expand on click to show full old/new values.

**Entity ID**: rendered as link to the relevant admin screen (e.g., ORDER → order detail).

**API**:
```
GET /api/v1/admin/audit-logs?page=0&size=20&action={}&entityType={}&userId={}&...
```

**Logged Actions** (`AuditAction` enum):

| Category | Actions |
|---|---|
| Order | `ORDER_CREATED`, `ORDER_CONFIRMED`, `ORDER_CANCELLED`, `ORDER_COMPLETED` |
| Inventory | `STOCK_IMPORTED`, `STOCK_ADJUSTED` |
| Product | `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED` |
| Voucher | `VOUCHER_CREATED`, `VOUCHER_UPDATED`, `VOUCHER_DELETED` |
| Payment | `PAYMENT_COMPLETED` |
| Admin | `REVIEW_MODERATED`, `USER_DISABLED` |

**Business rules**:
- Audit log entries are immutable — no edit, delete, or export buttons (Phase 1).
- `SUPER_ADMIN` access recommended for the most sensitive entries (`USER_DISABLED`, `PAYMENT_COMPLETED`).

---

## 4. State Machines Reference

### 4.1 Order Status — Full Machine

```
                         ┌──────────────┐
                         │   PENDING    │◀── initial state (all orders)
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              │          [ONLINE payment          │
              │           initiated]              │
              ▼                 ▼                 │
         ┌──────────┐  ┌──────────────────┐      │
         │CANCELLED │  │ AWAITING_PAYMENT │      │
         │(terminal)│  └────────┬─────────┘      │
         └──────────┘           │                 │
              ▲                 │ [customer        │
              │                 │  cancels]        │
              └─────────────────┘                 │
              ▲                                   │
              │ [customer cancels]                 │
              │                                   │
              └──────── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                                │
                          [Admin confirms]
                                │
                                ▼
                         ┌────────────┐
                         │ CONFIRMED  │
                         └─────┬──────┘
                               │ [Admin processes]
                               ▼
                        ┌────────────┐
                        │ PROCESSING │
                        └─────┬──────┘
                              │ [Admin creates shipment → auto]
                              ▼
                         ┌─────────┐
                         │ SHIPPED │
                         └────┬────┘
                              │ [Shipment → DELIVERED → auto]
                              ▼
                        ┌───────────┐
                        │ DELIVERED │
                        └─────┬─────┘
                              │ [Admin completes]
                              ▼
                        ┌───────────┐
                        │ COMPLETED │◀── enables customer reviews
                        └─────┬─────┘
                              │ [Phase 2: refund]
                              ▼
                        ┌──────────┐
                        │ REFUNDED │ (terminal)
                        └──────────┘
```

**Transition authority**:

| Transition | Who |
|---|---|
| → `AWAITING_PAYMENT` | Customer (initiates payment) |
| → `CANCELLED` | Customer (from PENDING/AWAITING_PAYMENT) |
| → `CONFIRMED` | Admin |
| → `PROCESSING` | Admin |
| → `SHIPPED` | System (auto on shipment creation) |
| → `DELIVERED` | System (auto on shipment status = DELIVERED) |
| → `COMPLETED` | Admin |

---

### 4.2 Payment Record Status

```
PENDING ──[initiate]──▶ INITIATED ──[callback: success]──▶ PAID
                                  └──[callback: fail]────▶ FAILED
        ──[COD mark paid]──────────────────────────────▶ PAID
        ──[Phase 2: refund]────────────────────────────▶ REFUNDED / PARTIALLY_REFUNDED
```

### 4.3 Shipment Status

```
PENDING ─┬──[In Transit]──▶ IN_TRANSIT ─┬──[Out for Delivery]──▶ OUT_FOR_DELIVERY
         │                              │                                 │
         └──[Fail]──▶ FAILED            └──[Fail]──▶ FAILED              ├──[Fail]──▶ FAILED
                         │                               │                │
                         └───────────┬───────────────────┘                │
                                     ▼                                     │
                                 RETURNED (terminal)            [Delivered]▼
                                                               DELIVERED (terminal)
                                                               → auto: Order → DELIVERED
```

**ShipmentStatus colour map**:

| Status | Colour |
|---|---|
| `PENDING` | Grey |
| `IN_TRANSIT` | Blue |
| `OUT_FOR_DELIVERY` | Amber |
| `DELIVERED` | Green |
| `FAILED` | Red |
| `RETURNED` | Red |

### 4.4 Invoice Status

```
ISSUED ──[Admin: mark paid]──▶ PAID   (terminal)
       ──[Admin: void]───────▶ VOIDED (terminal)
```

### 4.5 Review Status

```
PENDING ──[Admin approve]──▶ APPROVED (terminal — public)
        ──[Admin reject]───▶ REJECTED (terminal — customer-visible with note)
```

### 4.6 Product Status

```
DRAFT ──[Publish]──▶ PUBLISHED ──[Archive]──▶ ARCHIVED
```

Only `PUBLISHED` products visible to customers.

---

## 5. Admin Edge Cases & Race Conditions

### 5.1 Concurrent Admin Order Transitions

**Scenario**: Two admins have the same order open. Admin A confirms it; Admin B then tries to confirm (now invalid).

**Detection**: `ORDER_STATUS_INVALID` from `POST /confirm`.

**UI response** (Admin Order Detail):
- Toast: "This order was updated by another user. Refreshing…"
- Auto-reload order detail after 1 s.
- Updated state replaces stale state.

**Same pattern applies for**: shipment status updates, invoice status changes.

---

### 5.2 Duplicate Shipment Creation

**Scenario**: Admin A and Admin B both click "Create Shipment" on the same PROCESSING order.

**Detection**: `POST /admin/shipments` returns 409 — shipment already exists.

**UI response**:
- Error: "A shipment already exists for this order."
- Auto-reload order detail to show current SHIPPED state.

---

### 5.3 Stock Adjust Below Reserved

**Scenario**: Admin tries to reduce `onHand` via adjustment below the currently reserved quantity.

**Detection**: Client-side pre-check (`onHand + delta < reserved`).

**UI response**:
- "Confirm" button disabled with inline message: "Cannot reduce below {reserved} reserved units."
- If server rejects anyway (`INVENTORY_NOT_ENOUGH`): toast error.

---

### 5.4 Inventory Race on Stock Import / Adjust

**Scenario**: Two admins adjust stock for the same variant simultaneously. Optimistic locking (`version` column) detects conflict.

**Detection**: Server returns 409 or optimistic lock conflict.

**UI response**:
- Toast: "Stock was updated by another user. Please refresh and retry."
- Reload inventory grid.

---

### 5.5 Publishing Product with No Active Variants

**Scenario**: Admin publishes a product that has no ACTIVE variants.

**Detection**: Client-side check (variant count = 0 or all INACTIVE).

**UI response**:
- Amber warning banner on product edit form: "This product has no active variants. Customers will not be able to purchase it."
- Publish is still allowed — server does not block.

---

### 5.6 Voucher Deletion While In Use

**Scenario**: Admin deletes (soft-deletes) a voucher that is currently being validated by a customer mid-checkout.

**Effect**: Customer's subsequent `POST /orders` returns `VOUCHER_NOT_FOUND` — handled on customer side. No admin UI impact.

**Admin UI rule**: Soft-delete confirmation dialog notes: "Customers currently applying this code will not be able to use it."

---

## 6. Admin Error Codes Reference

| Error Code | HTTP | Admin Screen Context | Handling |
|---|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Login | "Email or password is incorrect" |
| `TOKEN_EXPIRED` | 401 | Any | Silent refresh → if fails: redirect to login |
| `ACCOUNT_DISABLED` | 403 | Login | "Your account has been disabled. Contact support." |
| `PRODUCT_NOT_FOUND` | 404 | Product Detail | "Product not found" |
| `INVENTORY_NOT_ENOUGH` | 422 | Inventory adjust | Toast: "Insufficient stock for this adjustment" |
| `ORDER_NOT_FOUND` | 404 | Order Detail | "Order not found" |
| `ORDER_STATUS_INVALID` | 422 | Order actions, shipment create | Toast: "Order status changed. Refreshing…" + auto-reload |
| `PAYMENT_NOT_FOUND` | 404 | Payment Detail | "Payment record not found" |
| `PAYMENT_ALREADY_PROCESSED` | 409 | Admin payment | Toast: "This payment has already been processed" |
| `SHIPMENT_NOT_FOUND` | 404 | Shipment Detail | "Shipment not found" |
| `INVOICE_NOT_FOUND` | 404 | Invoice | "Invoice not found" |
| `REVIEW_NOT_FOUND` | 404 | Review Moderation | "Review not found" |
| `VOUCHER_NOT_FOUND` | 404 | Voucher Detail | "Voucher not found" |
| `CONFLICT` | 409 | Admin forms (product/SKU/voucher code) | Field error: "A record with this value already exists" |
| `INTERNAL_SERVER_ERROR` | 500 | Any | Toast: "Something went wrong. Please try again later." |

---

*End of Admin UI/UX Specification — Fashion Shop Platform*
*Generated 2026-04-18. Extracted from: T:/Project/ecommerce-backend/ui-spec.md*
