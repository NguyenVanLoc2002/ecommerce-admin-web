# CLAUDE-ADMIN.md

## 1. Project Overview

Admin Web cho hệ thống **Fashion Shop** — giao diện quản trị dành cho STAFF, ADMIN, SUPER_ADMIN.

**Tech Stack**:
- React 18 + TypeScript (strict mode)
- Vite (build tool)
- TanStack Query v5 (server state)
- Zustand (client state)
- React Hook Form + Zod (forms & validation)
- Tailwind CSS (styling)
- React Router v6 (routing)

**Backend**: REST API tại `http://localhost:8080/api/v1`
**Auth**: Bearer access token + HttpOnly refresh-token cookie
**Roles**: `SUPER_ADMIN > ADMIN > STAFF`

---

## 2. Folder Structure

Feature-based architecture. Mỗi feature là một thư mục độc lập chứa đủ các lớp của nó.

```text
src/
│
├── app/                        # App-level setup
│   ├── App.tsx
│   ├── Router.tsx
│   └── providers/
│       ├── QueryProvider.tsx
│       └── AuthProvider.tsx
│
├── features/                   # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/
│   │   │   └── useLogin.ts
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   ├── schemas/
│   │   │   └── loginSchema.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── index.ts            # public exports only
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── VariantPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   ├── useCreateProduct.ts
│   │   │   └── useUpdateProduct.ts
│   │   ├── pages/
│   │   │   ├── ProductListPage.tsx
│   │   │   └── ProductEditPage.tsx
│   │   ├── schemas/
│   │   │   └── productSchema.ts
│   │   ├── services/
│   │   │   └── productService.ts
│   │   ├── types/
│   │   │   └── product.types.ts
│   │   └── index.ts
│   │
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
├── shared/                     # Dùng được ở mọi feature
│   ├── components/
│   │   ├── ui/                 # Primitive UI (Button, Input, Badge, Modal…)
│   │   ├── layout/             # AdminLayout, Sidebar, Header
│   │   ├── table/              # DataTable, TableToolbar, FilterChips
│   │   ├── form/               # FormField, FormSelect, FormDatePicker…
│   │   └── feedback/           # Toast, Skeleton, EmptyState, ErrorCard
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useTableFilters.ts
│   │   └── useConfirmDialog.ts
│   ├── lib/
│   │   ├── axios.ts            # Axios instance + interceptors
│   │   ├── queryClient.ts      # TanStack Query client config
│   │   └── zod.ts              # Shared zod helpers
│   ├── stores/
│   │   ├── authStore.ts        # Zustand auth store
│   │   └── uiStore.ts          # Zustand UI store (sidebar, toast queue)
│   ├── types/
│   │   ├── api.types.ts        # ApiResponse, PaginatedResponse, FieldError
│   │   ├── auth.types.ts
│   │   └── enums.ts            # OrderStatus, PaymentStatus… (mirror backend enums)
│   └── utils/
│       ├── formatMoney.ts
│       ├── formatDate.ts
│       └── cn.ts               # Tailwind class merging (clsx + twMerge)
│
├── constants/
│   ├── queryKeys.ts            # TanStack Query key factory
│   ├── routes.ts               # Route path constants
│   └── permissions.ts          # Role → allowed actions map
│
└── main.tsx
```

### Rules

- **Cross-feature imports are forbidden.** Feature A không được import trực tiếp từ `features/B/components/...`. Nếu cần dùng chung, move vào `shared/`.
- `index.ts` trong mỗi feature chỉ export những gì public. Internal components không export ra ngoài.
- Pages chỉ compose components + hooks. Không chứa business logic hoặc API calls trực tiếp.
- Không tạo `utils/` hay `helpers/` chung chứa đủ thứ lẫn lộn. Utilities phải có scope rõ ràng (shared hoặc feature).

---

## 3. Coding Rules

### 3.1 TypeScript

- `strict: true` trong `tsconfig.json`. Không tắt bất kỳ strict flag nào.
- Không dùng `any`. Dùng `unknown` nếu cần type-guard sau.
- Không dùng `as SomeType` trừ khi đã type-guard trước đó.
- Luôn type response từ API — không để `data: any`.
- Dùng `type` cho data shapes, `interface` cho object contracts có thể được extend.
- Enum của backend map sang `const` object + `type`:
  ```ts
  export const OrderStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    // ...
  } as const;
  export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
  ```

### 3.2 Component Rules

- Functional components only. Không dùng class components.
- Một file = một component chính. Không nhồi nhiều component vào một file.
- Props phải có type rõ ràng — không dùng `React.FC<any>`.
- Không dùng default export kết hợp với inline anonymous function:
  ```ts
  // Bad
  export default () => <div />;

  // Good
  export function ProductTable({ ... }: ProductTableProps) { ... }
  export default ProductTable;
  ```
- Không truyền raw object/array literals vào props nếu nó gây re-render không cần thiết. Dùng `useMemo` khi cần.
- Component không gọi API trực tiếp. Mọi data fetching đi qua custom hook.

### 3.3 Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `ProductTable.tsx` |
| Hook file | camelCase, prefix `use` | `useProducts.ts` |
| Service file | camelCase, suffix `Service` | `productService.ts` |
| Schema file | camelCase, suffix `Schema` | `productSchema.ts` |
| Type file | camelCase, suffix `.types` | `product.types.ts` |
| Store file | camelCase, suffix `Store` | `authStore.ts` |
| CSS class | Tailwind only — không viết custom class trừ khi thật sự cần |  |
| Query key | SCREAMING_SNAKE_CASE trong `queryKeys.ts` | `PRODUCTS`, `ORDER_DETAIL` |

### 3.4 General

- Không viết comment giải thích WHAT — code phải tự document được.
- Viết comment khi WHY là non-obvious: workaround, constraint ẩn, invariant bất ngờ.
- Không để `console.log` trong code production. Dùng error boundary hoặc logger nếu cần.
- Không hardcode string URL, route path, hay API endpoint trong component. Dùng constants.
- Xử lý loading, error, empty state ở mọi screen — không bỏ qua bất kỳ state nào.
- Không dùng `Math.random()` hay `Date.now()` làm React key. Dùng id từ data.

---

## 4. API Integration Rules

### 4.1 Axios Instance

File: `src/shared/lib/axios.ts`

```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://localhost:8080/api/v1
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});
```

**Request interceptor**: Attach `Authorization: Bearer <accessToken>` from the in-memory `authStore`.

**Response interceptor**:
- 401 on protected non-auth requests → attempt token refresh via `POST /auth/refresh-token`
  - send `withCredentials: true`
  - do not send `refreshToken` in the request body
  - never retry `/auth/login`, `/auth/register`, `/auth/refresh-token`, `/auth/logout`
  - refresh success → retry original request once with a one-time `_retry` flag
  - refresh fail → clear local auth state → redirect to `/login?redirect=<path>`
- logout must call `POST /auth/logout` with `withCredentials: true`, never send `refreshToken` in the request body, and must clear local auth state even if the backend request fails
- Unwrap `data` field từ `ApiResponse<T>` wrapper trước khi trả về caller
- Normalize `fieldErrors` array thành object `{ [field]: message }` cho React Hook Form `setError`

Only protected API calls use `Authorization`. Login, refresh, and logout must use `withCredentials: true` so the browser can send the refresh cookie.
Current backend docs also state CSRF is disabled for this stateless JWT flow, so frontend should not add an `X-XSRF-TOKEN` logout header unless the contract changes.

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
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;    // current page (zero-based)
  size: number;
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

Mỗi feature có `services/` chứa các hàm gọi API thuần túy. Service không biết về React, không gọi hook, không access store.

```ts
// features/products/services/productService.ts

import { apiClient } from '@/shared/lib/axios';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/product.types';
import type { PaginatedResponse } from '@/shared/types/api.types';

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

Tập trung tại `src/constants/queryKeys.ts`. Dùng factory pattern để đảm bảo key consistent:

```ts
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: ProductListParams) => [...queryKeys.products.lists(), params] as const,
    detail: (id: number) => [...queryKeys.products.all, 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (params: OrderListParams) => [...queryKeys.orders.lists(), params] as const,
    detail: (id: number) => [...queryKeys.orders.all, 'detail', id] as const,
  },
  // ... other features
};
```

### 4.5 TanStack Query Rules

- Mọi GET request dùng `useQuery` hoặc `useSuspenseQuery`.
- Mọi mutation (POST/PATCH/DELETE) dùng `useMutation`.
- `staleTime` mặc định: 30 giây cho list, 60 giây cho detail.
- Sau mutation thành công: `queryClient.invalidateQueries` để refresh list liên quan.
- Không dùng `queryClient.setQueryData` để update optimistically trừ các trường hợp được ghi rõ (xem §7).
- Không gọi API trong `useEffect`. Tất cả fetching đi qua TanStack Query.
- Error từ query được handle ở component (show `<ErrorCard>`) hoặc error boundary — không swallow silently.

```ts
// features/products/hooks/useProducts.ts

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '../services/productService';
import type { ProductListParams } from '../types/product.types';

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productService.getList(params),
    staleTime: 30_000,
  });
}
```

```ts
// features/products/hooks/useCreateProduct.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '../services/productService';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}
```

### 4.6 Pagination

Tất cả list API đều paginated. Params chuẩn:

```ts
export interface PaginationParams {
  page: number;   // zero-based
  size: number;   // default 20
  sort?: string;  // e.g. 'createdAt,desc'
}
```

Filter state + pagination state đều được sync vào URL search params để browser back/forward hoạt động đúng.

```ts
// shared/hooks/useTableFilters.ts
// Sync filter state ↔ URL params, provide debounced search, page reset on filter change
```

---

## 5. Component Guidelines

### 5.1 Page Components

Page component chịu trách nhiệm:
- Đọc route params / URL search params
- Gọi hooks để lấy data
- Compose layout và feature components
- Xử lý page-level loading/error states

Page component **không** chứa: form logic, API calls trực tiếp, business validation.

```tsx
// features/products/pages/ProductListPage.tsx

export function ProductListPage() {
  const [filters, setFilters] = useTableFilters(defaultFilters);
  const { data, isLoading, isError, refetch } = useProducts(filters);

  if (isLoading) return <SkeletonTable />;
  if (isError) return <ErrorCard onRetry={refetch} />;

  return (
    <AdminLayout>
      <ProductTable
        data={data.content}
        pagination={data}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </AdminLayout>
  );
}
```

### 5.2 DataTable (Shared)

Tất cả admin list screen dùng chung `<DataTable>` component với:
- Column definition (id, header, accessor, cell renderer)
- Built-in sort (click header)
- Built-in row selection + bulk action bar
- Built-in pagination + page size selector
- Toolbar slot (search, filter button, column toggle, create button)
- Filter chips slot
- Empty state / loading state / error state built-in

Feature chỉ cần định nghĩa columns và truyền data:

```tsx
const columns: ColumnDef<Product>[] = [
  { id: 'select', header: SelectAllHeader, cell: SelectCell },
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { id: 'actions', header: '', cell: ({ row }) => <ProductRowActions product={row.original} /> },
];
```

### 5.3 Form Components

Mọi form dùng React Hook Form + Zod:

```tsx
// features/products/components/ProductForm.tsx

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  brandId: z.number({ required_error: 'Brand is required' }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featured: z.boolean(),
  // ...
});

type ProductFormValues = z.infer<typeof schema>;

export function ProductForm({ defaultValues, onSubmit }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="name" label="Product Name" required />
        <FormField name="brandId" label="Brand">
          <BrandSelect />
        </FormField>
        <FormActions isSubmitting={form.formState.isSubmitting} />
      </form>
    </Form>
  );
}
```

**Sau khi server trả `fieldErrors`**: dùng `setError` từ React Hook Form để map lỗi vào đúng field.

```ts
mutation.mutate(data, {
  onError: (error) => {
    if (error.fieldErrors) {
      error.fieldErrors.forEach(({ field, message }) => {
        form.setError(field as keyof FormValues, { message });
      });
    }
  },
});
```

### 5.4 Dirty State Guard

Form với dữ liệu quan trọng (create/edit product, shipment, voucher) phải có dirty state guard:

```ts
const isDirty = form.formState.isDirty;

// Block router navigation nếu form dirty
useBeforeUnload(isDirty, 'Leave without saving?');
useBlocker(isDirty); // React Router v6 blocker
```

### 5.5 Confirmation Dialogs

Tất cả destructive action phải đi qua confirmation dialog trước khi gọi API:

```tsx
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

### 5.6 Loading & Feedback States

Mọi screen phải handle đủ:

| State | Component |
|---|---|
| Initial load (GET) | `<SkeletonTable />` hoặc `<SkeletonDetail />` |
| Action loading (mutation) | Button `isLoading` prop → spinner + disabled |
| Empty | `<EmptyState icon message cta />` |
| Error (GET) | `<ErrorCard message onRetry />` |
| Success (mutation) | Toast success |
| Field error (422) | Inline per-field message via `form.setError` |
| Not found (404) | `<NotFoundState />` |
| Forbidden (403) | `<ForbiddenState />` |

Không dùng `alert()`, `confirm()` native browser. Dùng `useConfirmDialog` hook.

---

## 6. State Management Rules

### 6.1 Phân loại state

| Loại state | Dùng gì |
|---|---|
| Server data (orders, products, ...) | TanStack Query |
| Form state | React Hook Form |
| URL state (filters, page, sort) | URL search params (`useSearchParams`) |
| Global auth state (tokens, user info, role) | Zustand `authStore` |
| Global UI state (sidebar open, toast queue) | Zustand `uiStore` |
| Local UI state (dropdown open, tab selected) | `useState` |

**Không dùng Zustand cho server data.** Server data luôn sống trong TanStack Query cache.

**Không dùng TanStack Query cho client-only state.** Auth state, UI state là client state, không phải server state.

### 6.2 Auth Store

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

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  role: null,
  isAuthResolved: false,
  setSession: ({ accessToken, user }) => set({ accessToken, user, role: null }),
  setAuthResolved: (isAuthResolved) => set({ isAuthResolved }),
  clear: () => set({ accessToken: null, user: null, role: null }),
}));
```

`accessToken` stays in memory only. Frontend must never persist `refreshToken` in `localStorage` or `sessionStorage`, and must never persist `accessToken` in `localStorage`.
Use `localStorage` only for non-sensitive UI state such as theme, locale, sidebar state, filters, and page-size preferences.

### 6.3 UI Store

```ts
// src/shared/stores/uiStore.ts

interface UiState {
  sidebarOpen: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}
```

### 6.4 URL State cho Tables

Filter và pagination state của admin tables phải sync với URL:

```ts
// ?status=PENDING&page=0&size=20&sort=createdAt,desc&keyword=abc

const [searchParams, setSearchParams] = useSearchParams();

const filters: OrderListParams = {
  status: searchParams.get('status') ?? undefined,
  page: Number(searchParams.get('page') ?? 0),
  size: Number(searchParams.get('size') ?? 20),
  sort: searchParams.get('sort') ?? 'createdAt,desc',
  keyword: searchParams.get('keyword') ?? undefined,
};
```

Lý do: browser back/forward hoạt động, link có thể share, refresh không mất filter.

### 6.5 Không duplicate state

- Nếu data đã có trong TanStack Query cache, không copy sang Zustand hay `useState`.
- Nếu value có thể được derive từ state khác, dùng selector/memo thay vì tạo thêm state.

---

## 7. Optimistic Updates

Chỉ áp dụng optimistic update cho những action có failure rate thấp và rollback đơn giản:

| Action | Optimistic | Rollback |
|---|---|---|
| Mark notification read | ✅ | Restore trạng thái cũ |

**Không dùng optimistic update cho**: order status transitions, payment actions, inventory changes — những action này cần confirmed server state.

```ts
useMutation({
  mutationFn: notificationService.markRead,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
    const previous = queryClient.getQueryData(queryKeys.notifications.list());
    queryClient.setQueryData(queryKeys.notifications.list(), (old) => /* update */);
    return { previous };
  },
  onError: (_err, _id, context) => {
    queryClient.setQueryData(queryKeys.notifications.list(), context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },
});
```

---

## 8. Role-Based Access Control

### 8.1 Role hierarchy

```
SUPER_ADMIN > ADMIN > STAFF
```

### 8.2 Permissions map

```ts
// src/constants/permissions.ts

export const permissions = {
  products: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'],
    write: ['STAFF', 'ADMIN', 'SUPER_ADMIN'],
    delete: ['STAFF', 'ADMIN', 'SUPER_ADMIN'],
  },
  vouchers: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'],
    write: ['ADMIN', 'SUPER_ADMIN'],    // STAFF read-only
    delete: ['ADMIN', 'SUPER_ADMIN'],
  },
  promotions: {
    read: ['STAFF', 'ADMIN', 'SUPER_ADMIN'],
    write: ['ADMIN', 'SUPER_ADMIN'],
    delete: ['ADMIN', 'SUPER_ADMIN'],
  },
  auditLog: {
    read: ['ADMIN', 'SUPER_ADMIN'],
  },
} as const;
```

### 8.3 Hook

```ts
export function usePermission(resource: string, action: string): boolean {
  const role = useAuthStore((s) => s.role);
  return permissions[resource]?.[action]?.includes(role) ?? false;
}
```

### 8.4 UI enforcement

- Nút write action của ADMIN-only: hiển thị nhưng disabled với tooltip "Requires Admin role" khi STAFF đăng nhập.
- Không ẩn hoàn toàn — STAFF cần biết tính năng tồn tại.
- Route guard: redirect về `/403` nếu role không có quyền truy cập route.
- Server vẫn là authority cuối cùng — client RBAC chỉ là UX layer.

---

## 9. Routing

```ts
// src/constants/routes.ts

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
  // ...
} as const;
```

**Route protection**:
- `<AuthGuard>`: redirect to `/login?redirect=<path>` nếu chưa authenticate.
- `<RoleGuard required={['ADMIN', 'SUPER_ADMIN']}>`: redirect to `/403` nếu role không đủ.

**Redirect sau login**: đọc `?redirect` param và navigate đến đó sau khi login thành công.

---

## 10. Error Handling

### 10.1 Global error boundary

Wrap toàn bộ app với error boundary. Log error, hiển thị fallback UI, không crash app.

### 10.2 Query errors

```tsx
const { data, isError, error, refetch } = useProducts(filters);

if (isError) {
  return <ErrorCard message={error.message} onRetry={refetch} />;
}
```

### 10.3 Mutation errors

```ts
mutation.mutate(payload, {
  onSuccess: () => toast.success('Product saved'),
  onError: (error) => {
    if (error.fieldErrors?.length) {
      error.fieldErrors.forEach(({ field, message }) =>
        form.setError(field, { message })
      );
    } else {
      toast.error(error.message ?? 'Something went wrong');
    }
  },
});
```

### 10.4 Error codes quan trọng

| Code | Xử lý |
|---|---|
| `ORDER_STATUS_INVALID` | Toast "Updated by another user. Refreshing…" + `refetch()` sau 1s |
| `PAYMENT_ALREADY_PROCESSED` | Toast error, disable nút |
| `INVENTORY_NOT_ENOUGH` | Toast error cụ thể |
| `CONFLICT` (409) | Map vào field error tương ứng |
| `INTERNAL_SERVER_ERROR` | Toast "Something went wrong. Please try again." |

---

## 11. Tailwind Guidelines

- Dùng Tailwind utility classes trực tiếp trong JSX. Không viết CSS file riêng trừ khi không thể dùng Tailwind.
- Tổ chức class với `cn()` helper (clsx + tailwind-merge) để tránh conflict:
  ```ts
  import { cn } from '@/shared/utils/cn';
  className={cn('base-classes', condition && 'conditional-class', className)}
  ```
- Variants của component (size, intent) định nghĩa bằng `cva` (class-variance-authority).
- Không hardcode color hex. Dùng Tailwind tokens (`text-red-500`, `bg-amber-100`...).
- Semantic color variables trong `tailwind.config.ts`:
  ```ts
  colors: {
    primary: { ... },
    danger: { ... },
    success: { ... },
    warning: { ... },
  }
  ```
- Responsive: mobile-first. Admin web tối thiểu support màn hình 1280px+.
- Dark mode: không bắt buộc Phase 1.

---

## 12. Branching & Commit Conventions

### Branch types
- `dev`: branch chính của admin web team
- `feat/`: tính năng mới
- `bugfix/`: sửa lỗi
- `hotfix/`: fix gấp production
- `refactor/`: tái cấu trúc

### Branch naming
```
{type}/{task_id}_{title}
```

Ví dụ:
- `feat/1001_product_list_table`
- `bugfix/1042_fix_order_confirm_button`

### Commit message
```
{type}({feature}): {title}

{description nếu cần}

{Fixes/Complete #issue_number}
```

Ví dụ:
```
feat(orders): add bulk confirm action to order list

Add checkbox selection and bulk confirm button
Invalidate order list query on success

Complete #1010
```

---

## 13. Environment Variables

```env
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SITE_URL=http://localhost:5174
VITE_APP_TITLE=Fashion Shop Admin
```

```env
# .env.production
VITE_API_BASE_URL=https://api.fashionshop.com/api/v1
VITE_SITE_URL=https://admin.fashionshop.com
VITE_APP_TITLE=Fashion Shop Admin
```

`VITE_SITE_URL` must match the frontend origin allowed by backend CORS/cookie settings.
Login, refresh, and logout rely on the backend HttpOnly refresh-token cookie, so local development must keep origin, cookie attributes, and `allowCredentials` aligned.
Không commit file `.env.local` hay `.env.production`. Chỉ commit `.env.example`.

---

## 14. Development Priorities

### Phase 1 — Core Admin
- auth (login / logout / token refresh)
- dashboard (KPI cards + queues)
- product + variant management
- category + brand management
- inventory management
- order management + status transitions
- shipment management

### Phase 2
- payment management
- invoice management
- promotion + voucher management
- review moderation

### Phase 3
- audit log
- dashboard analytics/charts
- notification management
- user management

---

## 15. AI Collaboration Instructions

Khi AI hỗ trợ code trong project này:

1. Không tự ý thêm thư viện mới nếu chưa có lý do rõ ràng và không có trong stack đã định nghĩa.
2. Luôn viết TypeScript strict — không dùng `any`, không bỏ qua type error.
3. Mọi API call đi qua service layer → custom hook → component. Không shortcut.
4. Khi tạo feature mới phải tạo đủ: service, hook(s), schema, types, component(s), page.
5. Khi tạo form phải có: Zod schema, React Hook Form setup, field-level error display, dirty state guard nếu cần.
6. Không viết business logic trong component. Component chỉ render và handle UI event.
7. Khi thêm API integration phải thêm query key vào `queryKeys.ts` và invalidate đúng query sau mutation.
8. Không lạm dụng `useEffect`. Server state dùng TanStack Query, không dùng `useEffect` + `fetch`.
9. Handle đủ 3 state của mọi async operation: loading, error, success.
10. Giữ nhất quán naming, file structure, và import pattern với phần còn lại của codebase.
