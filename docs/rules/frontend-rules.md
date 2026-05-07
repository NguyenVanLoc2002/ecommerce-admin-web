# Frontend Rules — Fashion Shop Admin Web

> Rules for implementing features in this codebase. All contributors (human and AI) must follow these exactly.

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React + TypeScript (strict) | React 18, TS 5+ |
| Build Tool | Vite | latest |
| Routing | React Router | v6 |
| Server State | TanStack Query | v5 |
| Client State | Zustand | latest |
| Forms | React Hook Form + Zod | latest |
| Styling | Tailwind CSS | v3 |
| HTTP Client | Axios | latest |
| Icons | Lucide React | latest |
| Class Utilities | clsx + tailwind-merge via `cn()` | latest |
| Variant Styling | class-variance-authority (`cva`) | latest |

**Backend API**: `http://localhost:8080/api/v1` (via `VITE_API_BASE_URL`)
**Auth**: Bearer access token + HttpOnly refresh-token cookie
**Roles**: `SUPER_ADMIN > ADMIN > STAFF`

Do not add libraries outside this stack without explicit justification.

---

## 2. Folder Structure

Feature-based architecture. Each feature is a self-contained module.

```text
src/
├── app/
│   ├── App.tsx
│   ├── Router.tsx
│   └── providers/
│       ├── QueryProvider.tsx
│       └── AuthProvider.tsx
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── index.ts          ← public exports only
│   ├── products/
│   ├── orders/
│   ├── inventory/
│   ├── payments/
│   ├── shipments/
│   ├── invoices/
│   ├── promotions/
│   ├── vouchers/
│   ├── reviews/
│   ├── categories/
│   ├── brands/
│   ├── audit-log/
│   └── dashboard/
│
├── shared/
│   ├── components/
│   │   ├── ui/               ← Button, Input, Badge, Modal, Select…
│   │   ├── layout/           ← AdminLayout, Sidebar, Header, PageHeader
│   │   ├── table/            ← DataTable, TableToolbar, FilterChips, BulkActionBar
│   │   ├── form/             ← FormField, FormSelect, FormDatePicker…
│   │   └── feedback/         ← Toast, Skeleton variants, EmptyState, ErrorCard
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useTableFilters.ts
│   │   └── useConfirmDialog.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── queryClient.ts
│   │   └── zod.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   └── enums.ts
│   └── utils/
│       ├── formatMoney.ts
│       ├── formatDate.ts
│       └── cn.ts
│
├── constants/
│   ├── queryKeys.ts
│   ├── routes.ts
│   └── permissions.ts
│
└── main.tsx
```

### Folder Rules

- **Cross-feature imports are forbidden.** Feature A must not import from `features/B/`. If shared, move to `shared/`.
- `index.ts` in each feature exports only the public surface. Internal components stay unexported.
- Pages only compose components and call hooks. No business logic, no direct API calls.
- `shared/utils/` and feature `utils/` must have clear, scoped purpose — no catch-all helper files.
- Each feature must contain its own `types/`, `schemas/`, `services/`, `hooks/`, `components/`, and `pages/` as needed.

---

## 3. TypeScript Rules

- `strict: true` is non-negotiable. Never disable any strict flag.
- Never use `any`. Use `unknown` + type-guard when the type is genuinely unknown.
- Never use `as SomeType` without a preceding type-guard.
- All API responses must be typed. Never leave `data: any`.
- Use `type` for data shapes; use `interface` for object contracts that may be extended.
- Backend enums map to `const` object + union type:

```ts
export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
```

---

## 4. API Integration Rules

### 4.1 Single Axios Instance

File: `src/shared/lib/axios.ts`

```ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});
```

Never create a second Axios instance in any feature.

**Request interceptor**: attach `Authorization: Bearer <accessToken>` from `authStore`.

**Response interceptor**:
- 401 on protected non-auth requests → attempt token refresh via `POST /auth/refresh-token`
  - refresh/login/logout must use `withCredentials: true`
  - do not send `refreshToken` in the request body
  - never retry `/auth/login`, `/auth/register`, `/auth/refresh-token`, `/auth/logout`
- Refresh success → retry original request once
- Refresh fail → `authStore.clear()` → redirect to `/login?redirect=<current-path>` → toast "Session expired. Please sign in again."
- Logout must call `POST /auth/logout` with `withCredentials: true`, never include `refreshToken` in the body, and always clear in-memory auth state plus React Query cache after the request settles, even on `401/403/5xx` or network failure.
- Implement request queue: if refresh is already in-flight, queue other 401-ed requests and replay after refresh.
- Unwrap `data` field from `ApiResponse<T>` wrapper before returning to caller.
- Normalize `fieldErrors[]` array to `{ [field]: message }` for React Hook Form `setError`.
- Current backend docs say CSRF is disabled for this stateless JWT setup, so do not invent a client-side CSRF token flow for logout until the backend contract changes.

**Network retry**:
- Retry GET requests up to 2 times with 1 s delay on network failure.
- Never auto-retry POST/PATCH/DELETE — mutations are user-triggered.

### 4.2 Response Types

```ts
// src/shared/types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;     // zero-based
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
```

### 4.3 Service Layer

Each feature has a `services/` file with pure API call functions. Services have no React dependency, no hook calls, no store access.

```ts
// features/products/services/productService.ts
export const productService = {
  getList: (params: ProductListParams) =>
    apiClient.get<PaginatedResponse<Product>>('/admin/products', { params }),
  getById: (id: number) =>
    apiClient.get<Product>(`/admin/products/${id}`),
  create: (body: CreateProductRequest) =>
    apiClient.post<Product>('/admin/products', body),
  update: (id: number, body: UpdateProductRequest) =>
    apiClient.patch<Product>(`/admin/products/${id}`, body),
  remove: (id: number) =>
    apiClient.delete(`/admin/products/${id}`),
};
```

### 4.4 Query Keys

All keys live in `src/constants/queryKeys.ts`. Use factory pattern:

```ts
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: ProductListParams) => [...queryKeys.products.lists(), params] as const,
    detail: (id: number) => [...queryKeys.products.all, 'detail', id] as const,
  },
};
```

When adding API integration for any feature: add keys here, reference them in hooks, invalidate `lists()` after mutations.

### 4.5 TanStack Query Rules

- All GET requests: `useQuery` or `useSuspenseQuery`.
- All mutations (POST/PATCH/DELETE): `useMutation`.
- `staleTime`: 30 s for lists, 60 s for details.
- After mutation success: `queryClient.invalidateQueries({ queryKey: queryKeys.X.lists() })`.
- Never use `queryClient.setQueryData` optimistically except for explicitly approved cases (mark notification read).
- Never call API in `useEffect`. All fetching goes through TanStack Query.
- Query errors surface to `<ErrorCard>` or an error boundary — never swallowed.

### 4.6 Pagination

All list APIs are paginated. Standard params:

```ts
export interface PaginationParams {
  page: number;   // zero-based
  size: number;   // default 20
  sort?: string;  // e.g. 'createdAt,desc'
}
```

Filter state + pagination state must be synced to URL search params. See §6.

---

## 5. State Management Rules

| State type | Tool |
|---|---|
| Server data | TanStack Query |
| Form state | React Hook Form |
| URL state (filters, page, sort) | URL search params (`useSearchParams`) |
| Global auth state | Zustand `authStore` |
| Global UI state (sidebar, toasts) | Zustand `uiStore` |
| Local UI state (dropdown, tab) | `useState` |

- **Never use Zustand for server data.** Server data lives in TanStack Query cache.
- **Never use TanStack Query for client-only state.**
- If a value can be derived from existing state, use a selector or memo — don't create new state.
- Never duplicate state: if data is in TanStack Query cache, don't copy it to Zustand or `useState`.

### 5.1 Auth Store

```ts
// src/shared/stores/authStore.ts
interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  role: Role | null;
  isAuthResolved: boolean;
  setSession: (session: AccessTokenResponse) => void;
  setAuthResolved: (isResolved: boolean) => void;
  clear: () => void;
}
```

`accessToken` should stay in memory when possible. Never store `refreshToken` in `localStorage` or `sessionStorage`, and never store `accessToken` in `localStorage`.
`localStorage` is only for non-sensitive admin UI state such as theme, locale, sidebar state, filters, and table preferences.
Logout must not attempt to delete the HttpOnly refresh cookie in JavaScript; backend logout clears it server-side.

### 5.2 URL State for Tables

```ts
// ?status=PENDING&page=0&size=20&sort=createdAt,desc&keyword=abc
const filters: OrderListParams = {
  status: searchParams.get('status') ?? undefined,
  page: Number(searchParams.get('page') ?? 0),
  size: Number(searchParams.get('size') ?? 20),
  sort: searchParams.get('sort') ?? 'createdAt,desc',
  keyword: searchParams.get('keyword') ?? undefined,
};
```

This ensures browser back/forward works and filter state survives page refresh.

---

## 6. Form Rules

Every form must use React Hook Form + Zod. No exceptions.

```ts
const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  brandId: z.number({ required_error: 'Brand is required' }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});
type FormValues = z.infer<typeof schema>;
```

- Schema lives in `features/{name}/schemas/`.
- All field validation must be defined in the Zod schema — not in component logic.
- After mutation fails with `fieldErrors`: map errors to form fields via `setError`.

```ts
mutation.mutate(data, {
  onError: (error) => {
    if (error.fieldErrors?.length) {
      error.fieldErrors.forEach(({ field, message }) =>
        form.setError(field as keyof FormValues, { message })
      );
    } else {
      toast.error(error.message ?? 'Something went wrong');
    }
  },
});
```

- **Dirty state guard** on all important forms (products, shipments, vouchers):

```ts
useBeforeUnload(form.formState.isDirty, 'Leave without saving?');
useBlocker(form.formState.isDirty);
```

- On validation error (422): keep form open with inline errors. Do not navigate away.
- Auto-save is out of scope for Phase 1.

---

## 7. Component Rules

- Functional components only. No class components.
- One primary component per file.
- Props must have explicit types. Never `React.FC<any>`.
- Never use default export with inline anonymous function:

```ts
// Bad
export default () => <div />;

// Good
export function ProductTable(props: ProductTableProps) { ... }
export default ProductTable;
```

- Components do not call APIs directly. All data fetching goes through custom hooks.
- No business logic in components. Components render UI and handle user events.
- Avoid passing raw object/array literals as props when it causes unnecessary re-renders. Use `useMemo`.

### 7.1 Page Components

Page component responsibilities:
- Read route params and URL search params
- Call hooks to get data
- Compose layout + feature components
- Handle page-level loading/error states

Page components must not contain: form logic, direct API calls, business validation.

### 7.2 DataTable (Shared)

All admin list screens use `<DataTable>` from `shared/components/table/`. Features define columns and pass data:

```ts
const columns: ColumnDef<Product>[] = [
  { id: 'select', header: SelectAllHeader, cell: SelectCell },
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { id: 'actions', header: '', cell: ({ row }) => <ProductRowActions product={row.original} /> },
];
```

`<DataTable>` provides built-in: sort, row selection, bulk action bar, pagination, toolbar slot, filter chips slot, empty/loading/error states.

### 7.3 Confirmation Dialogs

All destructive or irreversible actions require confirmation before the API call:

```ts
const { confirm } = useConfirmDialog();

const handleDelete = async (id: number) => {
  const ok = await confirm({
    title: 'Remove product?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Remove',
    variant: 'destructive',
  });
  if (!ok) return;
  deleteProduct.mutate(id);
};
```

Never use `window.alert()` or `window.confirm()`.

---

## 8. Loading / Empty / Error States

Every screen must handle all of the following. None can be omitted.

| State | Trigger | Component |
|---|---|---|
| Initial load | First render | `<SkeletonTable />` or `<SkeletonDetail />` |
| Filter/sort/page change | User action after initial load | Spinner in table body; keep headers visible |
| Action loading | Mutation in flight | Button spinner + disabled; label → "Saving…" |
| Empty (no data) | `items.length === 0` | `<EmptyState icon message cta />` |
| Error (GET) | Non-2xx or network failure | `<ErrorCard message onRetry />` |
| Validation error | 422 `fieldErrors` | Inline per-field message; red border on input |
| Forbidden | 403 | `<ForbiddenState />` with back button |
| Not found | 404 on detail page | `<NotFoundState />` with go-back link |
| Server error | 500 | Toast: "Something went wrong. Please try again." |
| Stale data / concurrency | `ORDER_STATUS_INVALID` | Toast "Record updated by another user. Refreshing…" + auto-reload |

Skeleton variants by context:

| Variant | Used for |
|---|---|
| `skeleton-table` | All list screens |
| `skeleton-detail` | Order, product, payment detail |
| `skeleton-form` | Create/edit product, shipment form |
| `skeleton-timeline` | Shipment events, audit log |
| `skeleton-stat` | Dashboard KPI cards |

---

## 9. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `ProductTable.tsx` |
| Hook file | camelCase, `use` prefix | `useProducts.ts` |
| Service file | camelCase, `Service` suffix | `productService.ts` |
| Schema file | camelCase, `Schema` suffix | `productSchema.ts` |
| Type file | camelCase, `.types` suffix | `product.types.ts` |
| Store file | camelCase, `Store` suffix | `authStore.ts` |
| Page file | PascalCase, `Page` suffix | `ProductListPage.tsx` |
| Query key | SCREAMING_SNAKE_CASE | `PRODUCTS`, `ORDER_DETAIL` |
| Route constant | camelCase in `routes.ts` | `routes.products.list` |
| CSS class | Tailwind utilities only | — |

---

## 10. Role-Based Access Control

### Role Hierarchy

```
SUPER_ADMIN > ADMIN > STAFF
```

### Permissions Map (`src/constants/permissions.ts`)

```ts
export const permissions = {
  products:   { read: ['STAFF','ADMIN','SUPER_ADMIN'], write: ['STAFF','ADMIN','SUPER_ADMIN'], delete: ['STAFF','ADMIN','SUPER_ADMIN'] },
  vouchers:   { read: ['STAFF','ADMIN','SUPER_ADMIN'], write: ['ADMIN','SUPER_ADMIN'], delete: ['ADMIN','SUPER_ADMIN'] },
  promotions: { read: ['STAFF','ADMIN','SUPER_ADMIN'], write: ['ADMIN','SUPER_ADMIN'], delete: ['ADMIN','SUPER_ADMIN'] },
  auditLog:   { read: ['ADMIN','SUPER_ADMIN'] },
} as const;
```

### `usePermission` Hook

```ts
export function usePermission(resource: string, action: string): boolean {
  const role = useAuthStore((s) => s.role);
  return permissions[resource]?.[action]?.includes(role) ?? false;
}
```

### UI Enforcement Rules

- ADMIN-only write actions: **show but disable** with tooltip "Requires Admin role" for STAFF. Never hide completely.
- Route guard: `<RoleGuard required={['ADMIN', 'SUPER_ADMIN']}>` redirects to `/403`.
- Auth guard: `<AuthGuard>` redirects to `/login?redirect=<path>` if unauthenticated.
- Server is the final authority. Client RBAC is UX-only.

---

## 11. Routing

Routes defined in `src/constants/routes.ts`:

```ts
export const routes = {
  login: '/login',
  dashboard: '/',
  products: {
    list: '/products',
    create: '/products/new',
    edit: (id: number | ':id') => `/products/${id}`,
    variants: (id: number | ':id') => `/products/${id}/variants`,
  },
  orders: {
    list: '/orders',
    detail: (id: number | ':id') => `/orders/${id}`,
  },
} as const;
```

Never hardcode route strings in components. Always use `routes.*`.

After login success: read `?redirect` param and navigate to that path.

---

## 12. Error Handling

### Known Error Codes

| Code | Handling |
|---|---|
| `ORDER_STATUS_INVALID` | Toast "Order status changed. Refreshing…" + `refetch()` after 1 s |
| `PAYMENT_ALREADY_PROCESSED` | Toast error; disable button |
| `INVENTORY_NOT_ENOUGH` | Toast error with specific message |
| `CONFLICT` (409) | Map to field error via `setError` |
| `INTERNAL_SERVER_ERROR` | Toast "Something went wrong. Please try again." |
| `ACCOUNT_DISABLED` | Toast "Your account has been disabled. Contact support." |

### Global Error Boundary

Wrap the entire app in an error boundary. Log errors; show fallback UI; do not crash the app.

---

## 13. Tailwind / Styling Rules

- Use Tailwind utility classes directly in JSX. No custom CSS files unless Tailwind cannot express the style.
- Always use `cn()` helper to compose classes and avoid conflicts:

```ts
import { cn } from '@/shared/utils/cn';
className={cn('base-classes', condition && 'conditional-class', className)}
```

- Use `cva` from class-variance-authority for component variants (size, intent):

```ts
const buttonVariants = cva('base', {
  variants: {
    intent: { primary: '...', destructive: '...' },
    size: { sm: '...', md: '...', lg: '...' },
  },
});
```

- Never hardcode hex colors. Use Tailwind tokens only (`text-red-500`, `bg-amber-100`).
- Semantic color aliases in `tailwind.config.ts`: `primary`, `danger`, `success`, `warning`.
- Minimum supported viewport: 1280px.
- Dark mode: not required for Phase 1.

---

## 14. Code Quality Rules for Claude

When implementing features:

1. Never add libraries not in the approved tech stack.
2. Always write strict TypeScript — no `any`, no ignored type errors.
3. Every API call flows: service → hook → component. No shortcuts.
4. When creating a new feature, create all layers: `types/`, `schemas/`, `services/`, `hooks/`, `components/`, `pages/`.
5. Every form requires: Zod schema, RHF setup, field-level error display, dirty state guard if data loss matters.
6. No business logic in components. Components render and handle UI events only.
7. Every new API integration requires: query key in `queryKeys.ts`, `invalidateQueries` after mutation success.
8. Never use `useEffect` for data fetching. Use TanStack Query.
9. Always handle loading, error, and success states for every async operation.
10. Follow existing naming, file structure, and import patterns exactly.
11. No `console.log` in production code.
12. Never hardcode URL strings, route paths, or API endpoints in components.
13. Use `id` from data as React keys. Never `Math.random()` or `Date.now()`.
14. Do not write comments explaining WHAT. Only comment WHY when non-obvious.

---

## 15. Money & Business Codes

- Display money with locale currency symbol and 2 decimal places.
- Never compute discounts or totals client-side — use values returned by the API.
- Business codes (order codes, payment codes, etc.) use monospace font with a copy-to-clipboard icon on hover.

---

## 16. Search / Filter Debounce

- Keyword/text search inputs: 300 ms debounce before firing API request.
- Numeric filter inputs: 500 ms debounce.
- Show a spinner inside the search input while the debounced request is in-flight.
- Product keyword search uses backend FULLTEXT. FE must keep sending the public `keyword` param, trim only leading/trailing whitespace, preserve Vietnamese accents, and never send or display `searchText` / `search_text`.
- When product keyword search is active, FE must trust backend relevance ordering and must not client-filter or client-resort the returned product list.
