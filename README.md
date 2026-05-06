# Fashion Shop — Admin Web

Giao diện quản trị cho hệ thống bán quần áo thời trang. Phục vụ các role: **STAFF**, **ADMIN**, **SUPER_ADMIN**.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Prerequisites](#2-prerequisites)
3. [Setup](#3-setup)
4. [Environment Variables](#4-environment-variables)
5. [Run](#5-run)
6. [Build](#6-build)
7. [Folder Structure](#7-folder-structure)
8. [Key Conventions](#8-key-conventions)
9. [Product Search Contract](#9-product-search-contract)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build Tool | Vite |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS + NativeWind |
| HTTP Client | Axios |
| Icons | Lucide React |

**Backend API**: `http://localhost:8080/api/v1`

---

## 2. Prerequisites

Cài đặt trên máy local trước khi bắt đầu:

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ | LTS recommended |
| npm / pnpm | latest | Project dùng `pnpm` nếu có |
| Git | any | — |

Backend phải đang chạy tại `http://localhost:8080` trước khi dùng app.

---

## 3. Setup

### 3.1 Clone repository

```bash
git clone <repository-url>
cd fashion-shop-admin
```

### 3.2 Install dependencies

```bash
npm install
# hoặc
pnpm install
```

### 3.3 Tạo file environment

```bash
cp .env.example .env.local
```

Sau đó điền giá trị vào `.env.local` (xem [§4 Environment Variables](#4-environment-variables)).

---

## 4. Environment Variables

### File `.env.local` (local development)

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SITE_URL=http://localhost:5173
VITE_APP_TITLE=Fashion Shop Admin
```

### File `.env.production` (production build)

```env
VITE_API_BASE_URL=https://api.fashionshop.com/api/v1
VITE_SITE_URL=https://admin.fashionshop.com
VITE_APP_TITLE=Fashion Shop Admin
```

### File `.env.example` (checked into git)

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SITE_URL=http://localhost:5173
VITE_APP_TITLE=Fashion Shop Admin
```

> **Lưu ý**: Không commit `.env.local` hay `.env.production`. Chỉ commit `.env.example`.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Base URL của backend API (không có trailing slash) |
| `VITE_SITE_URL` | ✅ | Public site URL của admin-web. Backend CORS + cookie origin phải match giá trị này |
| `VITE_APP_TITLE` | ✅ | Tên hiển thị trên browser tab |

### Admin auth contract

- `POST /api/v1/auth/login` trả `accessToken` trong JSON body và backend set `refreshToken` bằng HttpOnly cookie.
- `POST /api/v1/auth/refresh-token` đọc cookie, không gửi `refreshToken` trong request body.
- `POST /api/v1/auth/logout` phải gửi credentials để backend clear refresh cookie.
- Admin-web chỉ giữ `accessToken` trong memory. Không lưu `accessToken` hay `refreshToken` vào `localStorage`.
- `localStorage`/`sessionStorage` chỉ dùng cho UI data không nhạy cảm như theme, locale, sidebar state, page size, table preferences.
- Role/permission state ở frontend chỉ để UI gating. Backend vẫn là source of truth.

### Local development cookies/CORS

- Frontend phải gọi login/refresh/logout với `withCredentials: true` để browser chấp nhận và gửi lại refresh cookie.
- Backend phải allow credentials cho `VITE_SITE_URL`, và cookie attributes phải phù hợp với môi trường local hiện tại.
- Nếu session restore không chạy sau reload, kiểm tra trước: origin của frontend, backend CORS allow-credentials, cookie path `/api/v1/auth`, và `SameSite`/`Secure` của refresh cookie.

---

## 5. Run

### Development server

```bash
npm run dev
```

App chạy tại: **http://localhost:5173**

### Lint

```bash
npm run lint
```

### Type check

```bash
npm run typecheck
```

### Lint + Type check (trước khi push)

```bash
npm run lint && npm run typecheck
```

---

## 6. Build

### Production build

```bash
npm run build
```

Output tại thư mục `dist/`.

### Preview production build local

```bash
npm run preview
```

---

## 7. Folder Structure

```text
src/
│
├── app/                            # App-level setup
│   ├── App.tsx
│   ├── Router.tsx                  # Route definitions
│   └── providers/
│       ├── QueryProvider.tsx       # TanStack Query setup
│       └── AuthProvider.tsx        # Bootstrap auth state
│
├── features/                       # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/             # UI components scoped to this feature
│   │   ├── hooks/                  # Data hooks (useLogin, useRegister…)
│   │   ├── pages/                  # Page components (route entry points)
│   │   ├── schemas/                # Zod validation schemas
│   │   ├── services/               # API call functions
│   │   └── index.ts                # Public exports only
│   │
│   ├── products/                   # Product & variant management
│   ├── orders/                     # Order list, detail, status transitions
│   ├── inventory/                  # Warehouse, stock, adjustments
│   ├── payments/                   # Payment list, detail, mark paid
│   ├── shipments/                  # Shipment list, create, status update
│   ├── invoices/                   # Invoice view, void, mark paid
│   ├── promotions/                 # Promotion CRUD + rules
│   ├── vouchers/                   # Voucher CRUD + usage history
│   ├── reviews/                    # Review moderation queue
│   ├── categories/                 # Category management
│   ├── brands/                     # Brand management
│   ├── audit-log/                  # Audit log (read-only)
│   └── dashboard/                  # KPI cards + queues
│
├── shared/                         # Reusable across all features
│   ├── components/
│   │   ├── ui/                     # Primitive components (Button, Input, Badge…)
│   │   ├── layout/                 # AdminLayout, Sidebar, Header, PageHeader
│   │   ├── table/                  # DataTable, TableToolbar, FilterChips, BulkActionBar
│   │   ├── form/                   # FormField, FormSelect, FormDatePicker…
│   │   └── feedback/               # Toast, Skeleton variants, EmptyState, ErrorCard
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useTableFilters.ts      # URL-synced filter + pagination state
│   │   └── useConfirmDialog.ts
│   ├── lib/
│   │   ├── axios.ts                # Axios instance + interceptors
│   │   ├── queryClient.ts          # TanStack Query client config
│   │   └── zod.ts                  # Shared Zod helpers
│   ├── stores/
│   │   ├── authStore.ts            # Zustand: in-memory access token + derived auth session + role
│   │   └── uiStore.ts              # Zustand: sidebar state + toast queue
│   ├── types/
│   │   ├── api.types.ts            # ApiResponse, PaginatedResponse, FieldError
│   │   ├── auth.types.ts
│   │   └── enums.ts                # OrderStatus, PaymentStatus… (mirrors backend)
│   └── utils/
│       ├── formatMoney.ts
│       ├── formatDate.ts
│       └── cn.ts                   # Tailwind class merging (clsx + tailwind-merge)
│
├── constants/
│   ├── queryKeys.ts                # TanStack Query key factory
│   ├── routes.ts                   # Route path constants
│   └── permissions.ts              # Role → allowed actions map
│
└── main.tsx
```

### Quy tắc quan trọng

- **Cross-feature import cấm.** Feature A không được import từ `features/B/`. Nếu cần dùng chung, chuyển vào `shared/`.
- `index.ts` trong mỗi feature chỉ export những gì public.
- Page components chỉ compose components + gọi hooks. Không chứa business logic hoặc API calls trực tiếp.
- Filter state của admin table phải được sync vào URL search params.

---

## 8. Key Conventions

### API call flow

```
Page/Component
  → custom hook (useProducts, useCreateProduct…)
    → service function (productService.getList…)
      → Axios instance
        → Backend API
```

### State classification

| State type | Tool |
|---|---|
| Server data (fetched from API) | TanStack Query |
| Form state | React Hook Form |
| URL state (filters, pagination) | URL search params |
| Auth state (in-memory access token, derived user, role) | Zustand `authStore` |
| UI state (sidebar, toast queue) | Zustand `uiStore` |
| Local UI state (dropdown open…) | `useState` |

---

## 9. Product Search Contract

- Product Management search still uses the public `keyword` query param. Do not rename it and do not add `searchText`.
- Backend product keyword search now runs on MariaDB FULLTEXT over an internal `products.search_text` column. That field is backend-only and must never be sent to or rendered by the frontend.
- FE sends the user’s raw keyword after trimming leading/trailing whitespace only. Do not lowercase, strip accents, or otherwise normalize Vietnamese input on the client.
- When `keyword` is blank, FE omits it from the request and backend falls back to normal filtering.
- When `keyword` has text, backend controls relevance ordering. FE must not client-filter, client-rerank, or try to reproduce FULLTEXT relevance.
- Product list pagination uses `PagedResponse` fields: `items`, `page`, `size`, `totalItems`, `totalPages`, `hasNext`, `hasPrevious`.
- Admin-only maintenance endpoint: `POST /api/v1/admin/products/search/reindex`.

### Role-based access

- `STAFF`: read + limited write (no voucher/promotion write)
- `ADMIN`: full write access
- `SUPER_ADMIN`: full access + actuator endpoints

Write-only-for-ADMIN buttons: hiển thị nhưng **disabled** (với tooltip) cho STAFF — không ẩn hoàn toàn.

### Commit message format

```
{type}({feature}): {title}

{description nếu cần}

{Fixes/Complete #issue_number}
```

Ví dụ:
```
feat(orders): add bulk confirm action to order list

Complete #1010
```
