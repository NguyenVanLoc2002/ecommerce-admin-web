# Admin API Contract

> **Audience:** `admin-web` (ReactJS)
> **Generated from source code on 2026-04-19.**
> See `api-common.md` for shared conventions (response envelope, auth, enums, pagination).

---

## Overview

- **Base URL:** `/api/v1`
- **Auth:** `Authorization: Bearer <access_token>` (required for all admin endpoints)
- **Role guard:** All `/api/v1/admin/**` paths require at minimum `STAFF` role via `SecurityConfig`. Individual endpoints add stricter `@PreAuthorize` where noted.
- **Role hierarchy:** `SUPER_ADMIN > ADMIN > STAFF > CUSTOMER`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Category Management](#3-category-management)
4. [Brand Management](#4-brand-management)
5. [Product Management](#5-product-management)
6. [Variant Management](#6-variant-management)
7. [Inventory & Warehouse](#7-inventory--warehouse)
8. [Order Management](#8-order-management)
9. [Payment Management](#9-payment-management)
10. [Shipment Management](#10-shipment-management)
11. [Invoice Management](#11-invoice-management)
12. [Promotion Management](#12-promotion-management)
13. [Voucher Management](#13-voucher-management)
14. [Review Moderation](#14-review-moderation)
15. [Missing Admin Endpoints](#15-missing-admin-endpoints)

---

## 1. Authentication

Auth endpoints are shared with the customer app. See `app-api-contract.md §1`.

Admin users authenticate via the same `POST /api/v1/auth/login` endpoint. Their JWT will carry `ADMIN`, `STAFF`, or `SUPER_ADMIN` roles.

---

## 2. User Management

### 2.1 Create System User

- **Module:** Admin — User
- **Endpoint:** `POST /api/v1/admin/users`
- **Description:** Create a system user (STAFF, ADMIN, SUPER_ADMIN) with explicit role assignment. Does NOT create a customer profile. For customer registration use the public `/auth/register` endpoint.
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Request Body

```json
{
  "email": "staff@example.com",
  "password": "AdminPass123",
  "firstName": "Nguyen",
  "lastName": "Van Loc",
  "phoneNumber": "0912345678",
  "roles": ["STAFF"]
}
```

| Field | Type | Required | Nullable | Validation | Description |
|---|---|:---:|:---:|---|---|
| `email` | string | ✓ | No | valid email, max 255 | Login identifier |
| `password` | string | ✓ | No | 8–64 chars, 1 upper, 1 lower, 1 digit | Plain text — hashed server-side |
| `firstName` | string | ✓ | No | max 100 | First name |
| `lastName` | string | — | Yes | max 100 | Last name |
| `phoneNumber` | string | — | Yes | Vietnamese phone format | Phone number |
| `roles` | array[string] | ✓ | No | non-empty, valid `RoleName` values | Roles to assign |

Valid `roles` values: `SUPER_ADMIN`, `ADMIN`, `STAFF`. Do not use `CUSTOMER` here.

#### Response (201 Created)

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Created successfully",
  "data": {
    "id": 42,
    "email": "staff@example.com",
    "firstName": "Nguyen",
    "lastName": "Van Loc",
    "phoneNumber": "0912345678",
    "status": "ACTIVE",
    "roles": ["STAFF"],
    "createdAt": "2026-04-19T08:00:00Z"
  },
  "timestamp": "2026-04-19T08:00:00Z"
}
```

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |
| 409 | `PHONE_ALREADY_EXISTS` | Phone already registered |
| 400 | `BAD_REQUEST` | Role name not found in seed data |
| 422 | `VALIDATION_ERROR` | DTO validation failed |
| 403 | `FORBIDDEN` | Caller has STAFF role (ADMIN required) |

---

## 3. Category Management

### 3.1 List Active Categories

- **Endpoint:** `GET /api/v1/categories`
- **Auth:** Public (also accessible to admin)
- See `app-api-contract.md §2.1`

### 3.2 Get Category by ID

- **Endpoint:** `GET /api/v1/categories/{id}`
- **Auth:** Public
- See `app-api-contract.md §2.2`

### 3.3 Create Category

- **Endpoint:** `POST /api/v1/admin/categories`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN` (path-level guard)

#### Request Body

```json
{
  "name": "Áo",
  "slug": "ao",
  "description": "Danh mục áo",
  "parentId": null,
  "status": "ACTIVE"
}
```

| Field | Type | Required | Nullable | Validation | Description |
|---|---|:---:|:---:|---|---|
| `name` | string | ✓ | No | max 255 | Category name |
| `slug` | string | ✓ | No | max 255, unique | URL slug |
| `description` | string | — | Yes | max 500 | Description |
| `parentId` | long | — | Yes | existing category ID | Parent category |
| `status` | string | — | Yes | `CategoryStatus` enum | Default: `ACTIVE` |

> **NOT FOUND IN CODE:** Full field validation constraints for CreateCategoryRequest were not read. Fields above are inferred from CategoryResponse + CategoryStatus enum. Verify with source DTO.

#### Response (201)

```json
{
  "data": {
    "id": 1,
    "name": "Áo",
    "slug": "ao",
    "description": "Danh mục áo",
    "parentId": null,
    "status": "ACTIVE",
    "createdAt": "2026-04-19T08:00:00Z"
  }
}
```

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 409 | `SLUG_ALREADY_EXISTS` | Slug already in use |
| 422 | `VALIDATION_ERROR` | Validation failed |

### 3.4 Update Category

- **Endpoint:** `PATCH /api/v1/admin/categories/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Path params:** `id` (long) — category ID

All fields optional (partial update).

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 404 | `CATEGORY_NOT_FOUND` | Category does not exist |
| 409 | `SLUG_ALREADY_EXISTS` | Slug conflict |

### 3.5 Delete Category (Soft)

- **Endpoint:** `DELETE /api/v1/admin/categories/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

Returns `200` with `data: null`.

---

## 4. Brand Management

### 4.1 Create Brand

- **Endpoint:** `POST /api/v1/admin/brands`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

#### Request Body

```json
{
  "name": "Nike",
  "slug": "nike",
  "logoUrl": "https://cdn.example.com/brands/nike.png",
  "description": "American sportswear brand",
  "status": "ACTIVE"
}
```

> **NOT FOUND IN CODE:** Full CreateBrandRequest DTO fields not read. Fields above are inferred from BrandResponse. Verify with source DTO.

#### Response (201)

```json
{
  "data": {
    "id": 1,
    "name": "Nike",
    "slug": "nike",
    "logoUrl": "https://cdn.example.com/brands/nike.png",
    "description": "American sportswear brand",
    "status": "ACTIVE",
    "createdAt": "2026-04-19T08:00:00Z"
  }
}
```

### 4.2 Update Brand

- **Endpoint:** `PATCH /api/v1/admin/brands/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 4.3 Delete Brand (Soft)

- **Endpoint:** `DELETE /api/v1/admin/brands/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

---

## 5. Product Management

### 5.1 List All Products (including drafts)

- **Endpoint:** `GET /api/v1/admin/products`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Query Params

| Param | Type | Required | Description |
|---|---|:---:|---|
| `keyword` | string | — | Search by product name |
| `categoryId` | long | — | Filter by category |
| `brandId` | long | — | Filter by brand |
| `status` | string | — | `DRAFT`, `PUBLISHED`, `INACTIVE` |
| `minPrice` | decimal | — | Min variant price |
| `maxPrice` | decimal | — | Max variant price |
| `featured` | boolean | — | Featured products only |
| `page` | integer | — | Default: 0 |
| `size` | integer | — | Default: 20, max: 100 |
| `sort` | string | — | Default: `createdAt,desc` |

#### Response (200) — Paginated

```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Áo thun basic nam",
        "slug": "ao-thun-basic-nam",
        "status": "PUBLISHED",
        "featured": false,
        "brand": { "id": 1, "name": "Nike" },
        "createdAt": "2026-04-19T08:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalItems": 55,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 5.2 Get Product Detail (Admin — no status filter)

- **Endpoint:** `GET /api/v1/admin/products/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

Returns full `ProductDetailResponse` including drafts and all variants/media.

#### Response (200)

```json
{
  "data": {
    "id": 1,
    "name": "Áo thun basic nam",
    "slug": "ao-thun-basic-nam",
    "shortDescription": "Áo thun cotton cơ bản",
    "description": "Full description...",
    "status": "DRAFT",
    "featured": false,
    "brand": { "id": 1, "name": "Nike", "slug": "nike" },
    "categories": [ { "id": 1, "name": "Áo", "slug": "ao" } ],
    "variants": [ ... ],
    "media": [ ... ],
    "createdAt": "2026-04-19T08:00:00Z",
    "updatedAt": "2026-04-19T09:00:00Z"
  }
}
```

### 5.3 Create Product

- **Endpoint:** `POST /api/v1/admin/products`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Request Body

```json
{
  "name": "Áo thun basic nam",
  "slug": "ao-thun-basic-nam",
  "shortDescription": "Áo thun cotton cơ bản, phù hợp mọi dịp",
  "description": "Full HTML description...",
  "brandId": 1,
  "categoryIds": [1, 2],
  "status": "DRAFT",
  "featured": false
}
```

| Field | Type | Required | Nullable | Validation | Description |
|---|---|:---:|:---:|---|---|
| `name` | string | ✓ | No | max 255 | Product name |
| `slug` | string | ✓ | No | max 255, unique | URL slug |
| `shortDescription` | string | — | Yes | max 500 | Short description |
| `description` | string | — | Yes | — | Full description (HTML) |
| `brandId` | long | — | Yes | existing brand ID | Brand reference |
| `categoryIds` | array[long] | — | Yes | existing category IDs | Category references |
| `status` | string | — | Yes | `ProductStatus` | Default: `DRAFT` |
| `featured` | boolean | — | Yes | — | Default: `false` |

#### Response (201) — `ProductDetailResponse`

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 409 | `SLUG_ALREADY_EXISTS` | Slug conflict |
| 404 | `BRAND_NOT_FOUND` | Brand ID not found |
| 404 | `CATEGORY_NOT_FOUND` | Category ID not found |
| 422 | `VALIDATION_ERROR` | Validation failed |

### 5.4 Update Product

- **Endpoint:** `PATCH /api/v1/admin/products/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`
- All fields optional.

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 404 | `PRODUCT_NOT_FOUND` | Product not found |
| 409 | `SLUG_ALREADY_EXISTS` | Slug conflict |

### 5.5 Delete Product (Soft)

- **Endpoint:** `DELETE /api/v1/admin/products/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

Returns `200` with `data: null`.

---

## 6. Variant Management

All variant endpoints live under the product path.

### 6.1 List Variants for a Product

- **Endpoint:** `GET /api/v1/admin/products/{productId}/variants`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "sku": "ATBN-WH-M",
      "barcode": "9876543210",
      "variantName": "Trắng / M",
      "basePrice": 200000.00,
      "salePrice": 150000.00,
      "compareAtPrice": 250000.00,
      "weightGram": 200,
      "status": "ACTIVE",
      "attributes": [
        { "attributeName": "Color", "value": "Trắng" },
        { "attributeName": "Size", "value": "M" }
      ]
    }
  ]
}
```

### 6.2 Create Variant

- **Endpoint:** `POST /api/v1/admin/products/{productId}/variants`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Request Body

```json
{
  "sku": "ATBN-WH-M",
  "barcode": "9876543210",
  "variantName": "Trắng / M",
  "basePrice": 200000.00,
  "salePrice": 150000.00,
  "compareAtPrice": 250000.00,
  "weightGram": 200,
  "status": "ACTIVE",
  "attributes": [
    { "attributeName": "Color", "value": "Trắng" },
    { "attributeName": "Size", "value": "M" }
  ]
}
```

| Field | Type | Required | Nullable | Validation | Description |
|---|---|:---:|:---:|---|---|
| `sku` | string | ✓ | No | max 100, unique | Stock keeping unit |
| `barcode` | string | — | Yes | max 100 | Barcode |
| `variantName` | string | ✓ | No | max 255 | Display name |
| `basePrice` | decimal | ✓ | No | > 0 | Original price |
| `salePrice` | decimal | — | Yes | > 0 | Sale price (if on sale) |
| `compareAtPrice` | decimal | — | Yes | > 0 | Strikethrough price |
| `weightGram` | integer | — | Yes | — | Weight in grams |
| `status` | string | — | Yes | `ProductVariantStatus` | Default: `ACTIVE` |
| `attributes` | array | — | Yes | — | Attribute key-value pairs |
| `attributes[].attributeName` | string | ✓ | No | — | e.g., "Color", "Size" |
| `attributes[].value` | string | ✓ | No | — | e.g., "Trắng", "M" |

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 409 | `SKU_ALREADY_EXISTS` | SKU already in use |
| 404 | `PRODUCT_NOT_FOUND` | Product not found |
| 422 | `VALIDATION_ERROR` | Validation failed |

### 6.3 Update Variant

- **Endpoint:** `PATCH /api/v1/admin/products/{productId}/variants/{variantId}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`
- All fields optional.

### 6.4 Delete Variant (Soft)

- **Endpoint:** `DELETE /api/v1/admin/products/{productId}/variants/{variantId}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

---

## 7. Inventory & Warehouse

### 7.1 List Active Warehouses

- **Endpoint:** `GET /api/v1/admin/warehouses`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "name": "Kho HCM",
      "code": "WHM-001",
      "address": "123 Đường ABC, Q.1, TP.HCM",
      "status": "ACTIVE"
    }
  ]
}
```

### 7.2 Get Warehouse by ID

- **Endpoint:** `GET /api/v1/admin/warehouses/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 7.3 Create Warehouse

- **Endpoint:** `POST /api/v1/admin/warehouses`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

> **NOT FOUND IN CODE:** Full CreateWarehouseRequest DTO fields not read. Verify with source DTO.

### 7.4 Update Warehouse

- **Endpoint:** `PATCH /api/v1/admin/warehouses/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

### 7.5 Delete Warehouse (Soft)

- **Endpoint:** `DELETE /api/v1/admin/warehouses/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

### 7.6 Get Inventory by Variant

- **Endpoint:** `GET /api/v1/admin/inventories/variant/{variantId}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

Returns stock levels across all warehouses for the given variant.

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "variantId": 1,
      "variantName": "Trắng / M",
      "sku": "ATBN-WH-M",
      "warehouseId": 1,
      "warehouseName": "Kho HCM",
      "onHand": 100,
      "reserved": 5,
      "available": 95,
      "updatedAt": "2026-04-19T08:00:00Z"
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `onHand` | integer | Physical stock |
| `reserved` | integer | Stock held for pending orders |
| `available` | integer | `onHand - reserved` |

### 7.7 Get Inventory by Warehouse

- **Endpoint:** `GET /api/v1/admin/inventories/warehouse/{warehouseId}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 7.8 Get Inventory Detail (Variant + Warehouse)

- **Endpoint:** `GET /api/v1/admin/inventories/variant/{variantId}/warehouse/{warehouseId}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 7.9 Get Stock Movement History

- **Endpoint:** `GET /api/v1/admin/inventories/movements`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

#### Query Params

| Param | Type | Required | Description |
|---|---|:---:|---|
| `variantId` | long | — | Filter by variant |
| `warehouseId` | long | — | Filter by warehouse |
| `movementType` | string | — | `IMPORT`, `EXPORT`, `ADJUSTMENT`, `RETURN` |
| `page` | integer | — | Default: 0 |
| `size` | integer | — | Default: 20 |

#### Response (200) — Paginated `StockMovementResponse`

> **NOT FOUND IN CODE:** Full StockMovementResponse DTO fields not read. Verify with source DTO.

### 7.10 Adjust Stock

- **Endpoint:** `POST /api/v1/admin/inventories/adjust`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Request Body

```json
{
  "variantId": 1,
  "warehouseId": 1,
  "quantity": 50,
  "movementType": "IMPORT",
  "note": "Nhập hàng mới từ nhà cung cấp ABC"
}
```

| Field | Type | Required | Nullable | Validation | Description |
|---|---|:---:|:---:|---|---|
| `variantId` | long | ✓ | No | — | Target variant |
| `warehouseId` | long | ✓ | No | — | Target warehouse |
| `quantity` | integer | ✓ | No | > 0 | Quantity to adjust |
| `movementType` | string | ✓ | No | `IMPORT`, `EXPORT`, `ADJUSTMENT`, `RETURN` | Type of movement |
| `note` | string | — | Yes | max 500 | Admin note |

### 7.11 Manually Reserve Stock

- **Endpoint:** `POST /api/v1/admin/inventories/reserve`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

> **NOT FOUND IN CODE:** Full ReserveStockRequest DTO fields not read. Verify with source DTO.

### 7.12 Release Reserved Stock

- **Endpoint:** `POST /api/v1/admin/inventories/release`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Query Params

| Param | Type | Required | Description |
|---|---|:---:|---|
| `referenceType` | string | ✓ | e.g., `ORDER` |
| `referenceId` | string | ✓ | e.g., `ORD20260419001` |

---

## 8. Order Management

### 8.1 List All Orders

- **Endpoint:** `GET /api/v1/admin/orders`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

#### Query Params (OrderAdminFilter)

> **NOT FOUND IN CODE:** Full OrderAdminFilter fields not read. Common filters expected: `status`, `paymentStatus`, `customerId`, `orderCode`, `fromDate`, `toDate`. Verify with source DTO.

| Param | Type | Required | Description |
|---|---|:---:|---|
| `page` | integer | — | Default: 0 |
| `size` | integer | — | Default: 20 |

#### Response (200) — Paginated `AdminOrderListItemResponse`

```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "orderCode": "ORD20260419001",
        "customerId": 5,
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "paymentMethod": "COD",
        "totalAmount": 350000.00,
        "createdAt": "2026-04-19T08:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalItems": 200,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

> **NOT FOUND IN CODE:** Full AdminOrderListItemResponse fields not read. Verify with source DTO.

### 8.2 Get Order Detail by ID

- **Endpoint:** `GET /api/v1/admin/orders/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- No ownership check.

#### Response (200) — `OrderResponse`

```json
{
  "data": {
    "id": 1,
    "orderCode": "ORD20260419001",
    "customerId": 5,
    "status": "CONFIRMED",
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "receiverName": "Nguyen Van Loc",
    "receiverPhone": "0912345678",
    "shippingStreet": "123 Nguyen Hue",
    "shippingWard": "Phuong Ben Nghe",
    "shippingDistrict": "Quan 1",
    "shippingCity": "TP. Ho Chi Minh",
    "shippingPostalCode": "700000",
    "subTotal": 400000.00,
    "discountAmount": 50000.00,
    "shippingFee": 0.00,
    "totalAmount": 350000.00,
    "voucherCode": "SALE50K",
    "customerNote": "Giao giờ hành chính",
    "items": [
      {
        "id": 1,
        "variantId": 1,
        "productName": "Áo thun basic nam",
        "variantName": "Trắng / M",
        "sku": "ATBN-WH-M",
        "unitPrice": 200000.00,
        "quantity": 2,
        "lineTotal": 400000.00,
        "discountAmount": 50000.00
      }
    ],
    "createdAt": "2026-04-19T08:00:00Z"
  }
}
```

### 8.3 Get Order by Code

- **Endpoint:** `GET /api/v1/admin/orders/code/{orderCode}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Path params:** `orderCode` (string, e.g., `ORD20260419001`)

### 8.4 Confirm Order

- **Endpoint:** `POST /api/v1/admin/orders/{id}/confirm`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Transition:** `PENDING` / `AWAITING_PAYMENT` → `CONFIRMED`

Returns `200` with updated `OrderResponse`.

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 404 | `ORDER_NOT_FOUND` | Order not found |
| 422 | `ORDER_STATUS_INVALID` | Invalid transition |

### 8.5 Mark as Processing

- **Endpoint:** `POST /api/v1/admin/orders/{id}/process`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Transition:** `CONFIRMED` → `PROCESSING`

### 8.6 Mark as Delivered

- **Endpoint:** `POST /api/v1/admin/orders/{id}/deliver`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Transition:** `SHIPPED` → `DELIVERED`
- **Note:** `SHIPPED` status is set automatically when a shipment is created.

### 8.7 Complete Order

- **Endpoint:** `POST /api/v1/admin/orders/{id}/complete`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Transition:** `DELIVERED` → `COMPLETED`
- **Note:** Commits reserved stock.

### 8.8 Cancel Order (Admin)

- **Endpoint:** `POST /api/v1/admin/orders/{id}/cancel`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN` ← more restrictive than class-level
- **Cancellable from:** `PENDING`, `AWAITING_PAYMENT`, `CONFIRMED`
- **Effect:** Releases reserved stock.

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 422 | `ORDER_CANNOT_CANCEL` | Status does not allow cancellation |
| 403 | `FORBIDDEN` | STAFF role insufficient |

---

## 9. Payment Management

### 9.1 List All Payments

- **Endpoint:** `GET /api/v1/admin/payments`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

> **NOT FOUND IN CODE:** PaymentFilter fields not read. Verify with source DTO.

#### Response (200) — Paginated `PaymentResponse`

### 9.2 Get Payment by ID

- **Endpoint:** `GET /api/v1/admin/payments/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 9.3 Get Payment by Code

- **Endpoint:** `GET /api/v1/admin/payments/code/{code}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 9.4 Get Payment by Order ID

- **Endpoint:** `GET /api/v1/admin/payments/order/{orderId}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 9.5 Complete COD Payment

- **Endpoint:** `POST /api/v1/admin/payments/order/{orderId}/complete`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Description:** Marks COD payment as PAID and syncs `order.paymentStatus`. Call when delivery agent confirms cash collected. Idempotent.

#### Response (200) — `PaymentResponse`

```json
{
  "data": {
    "id": 1,
    "orderId": 1,
    "orderCode": "ORD20260419001",
    "paymentCode": "PAY20260419001",
    "method": "COD",
    "status": "PAID",
    "amount": 350000.00,
    "paidAt": "2026-04-19T10:00:00Z",
    "transactions": [ ... ],
    "createdAt": "2026-04-19T08:00:00Z"
  }
}
```

### 9.6 Get Transaction Audit Trail

- **Endpoint:** `GET /api/v1/admin/payments/{id}/transactions`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

Returns all `TransactionResponse` records for a payment.

> **NOT FOUND IN CODE:** Full TransactionResponse fields not read. Verify with source DTO.

---

## 10. Shipment Management

### 10.1 Create Shipment

- **Endpoint:** `POST /api/v1/admin/shipments`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Pre-condition:** Order must be in `PROCESSING` status.
- **Side effect:** Transitions order to `SHIPPED`.

#### Request Body

> **NOT FOUND IN CODE:** Full CreateShipmentRequest DTO fields not read. Expected: `orderId`, `carrier`, `trackingNumber`, `estimatedDeliveryDate`. Verify with source DTO.

#### Response (201) — `ShipmentResponse`

> **NOT FOUND IN CODE:** Full ShipmentResponse DTO fields not read. Verify with source DTO.

### 10.2 Get Shipment by ID

- **Endpoint:** `GET /api/v1/admin/shipments/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 10.3 Get Shipment by Order ID

- **Endpoint:** `GET /api/v1/admin/shipments/order/{orderId}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 10.4 List Shipments

- **Endpoint:** `GET /api/v1/admin/shipments`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

#### Query Params

| Param | Type | Required | Description |
|---|---|:---:|---|
| `page` | integer | — | Default: 0 |
| `size` | integer | — | Default: 20 |
| `sort` | string | — | Default: `createdAt` |
| `direction` | string | — | `asc` or `desc`. Default: `desc` |

> **NOT FOUND IN CODE:** ShipmentFilter fields not read. Verify with source DTO.

### 10.5 Update Shipment Details

- **Endpoint:** `PATCH /api/v1/admin/shipments/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Description:** Update carrier, tracking number, dates, note.

> **NOT FOUND IN CODE:** Full UpdateShipmentRequest DTO fields not read. Verify with source DTO.

### 10.6 Update Shipment Status

- **Endpoint:** `PATCH /api/v1/admin/shipments/{id}/status`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Description:** Advances shipment status and records a tracking event. Validates state machine. On `DELIVERED`, transitions order to `DELIVERED`.

**Status transitions:**
```
PENDING → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED (terminal)
         IN_TRANSIT → FAILED
         OUT_FOR_DELIVERY → FAILED
         FAILED → RETURNED (terminal)
```

> **NOT FOUND IN CODE:** Full UpdateShipmentStatusRequest DTO fields not read. Verify with source DTO.

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 422 | `SHIPMENT_STATUS_INVALID` | Invalid transition |

---

## 11. Invoice Management

### 11.1 Generate Invoice

- **Endpoint:** `POST /api/v1/admin/invoices/order/{orderId}/generate`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Description:** Idempotent — returns existing invoice if one already exists. Order must be in `CONFIRMED` or later active status.

#### Response (201) — `InvoiceResponse`

> **NOT FOUND IN CODE:** Full InvoiceResponse DTO fields not read. Expected: `id`, `invoiceCode`, `orderId`, `status`, `issuedAt`, `lineItems`. Verify with source DTO.

### 11.2 Get Invoice by ID

- **Endpoint:** `GET /api/v1/admin/invoices/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 11.3 Get Invoice by Order ID

- **Endpoint:** `GET /api/v1/admin/invoices/order/{orderId}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 11.4 Get Invoice by Code

- **Endpoint:** `GET /api/v1/admin/invoices/code/{invoiceCode}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 11.5 List Invoices

- **Endpoint:** `GET /api/v1/admin/invoices`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

#### Query Params

| Param | Type | Required | Description |
|---|---|:---:|---|
| `page` | integer | — | Default: 0 |
| `size` | integer | — | Default: 20 |
| `sort` | string | — | Default: `issuedAt` |
| `direction` | string | — | `asc` or `desc`. Default: `desc` |

> **NOT FOUND IN CODE:** InvoiceFilter fields not read. Verify with source DTO.

### 11.6 Update Invoice Status

- **Endpoint:** `PATCH /api/v1/admin/invoices/{id}/status`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

**Allowed transitions:** `ISSUED` → `PAID` | `ISSUED` → `VOIDED`

> **NOT FOUND IN CODE:** Full UpdateInvoiceStatusRequest DTO not read. Verify with source DTO.

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 422 | `INVOICE_STATUS_INVALID` | Invalid transition |
| 409 | `INVOICE_ALREADY_EXISTS` | Invoice already exists |

---

## 12. Promotion Management

### 12.1 Create Promotion

- **Endpoint:** `POST /api/v1/admin/promotions`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Request Body

```json
{
  "name": "Summer Sale 2026",
  "description": "20% off all products",
  "discountType": "PERCENTAGE",
  "discountValue": 20.00,
  "maxDiscountAmount": 100000.00,
  "minimumOrderAmount": 200000.00,
  "scope": "ALL",
  "startDate": "2026-06-01T00:00:00",
  "endDate": "2026-06-30T23:59:59",
  "usageLimit": 1000
}
```

| Field | Type | Required | Nullable | Validation | Description |
|---|---|:---:|:---:|---|---|
| `name` | string | ✓ | No | max 200 | Promotion name |
| `description` | string | — | Yes | max 2000 | Description |
| `discountType` | string | ✓ | No | `PERCENTAGE`, `FIXED_AMOUNT` | Discount calculation type |
| `discountValue` | decimal | ✓ | No | > 0.01 | Discount value |
| `maxDiscountAmount` | decimal | — | Yes | > 0.01 | Cap for PERCENTAGE type |
| `minimumOrderAmount` | decimal | — | Yes | >= 0 | Minimum order to qualify |
| `scope` | string | ✓ | No | `PromotionScope` | `ALL`, `CATEGORY`, `BRAND`, `PRODUCT` |
| `startDate` | datetime | ✓ | No | ISO-8601 | Activation date |
| `endDate` | datetime | ✓ | No | ISO-8601 | Expiry date |
| `usageLimit` | integer | — | Yes | >= 1 | Total usage cap |

#### Response (201) — `PromotionResponse`

> **NOT FOUND IN CODE:** Full PromotionResponse fields not read. Expected: `id`, `name`, `discountType`, `discountValue`, `scope`, `startDate`, `endDate`, `active`, `rules`. Verify with source DTO.

### 12.2 Get Promotion by ID

- **Endpoint:** `GET /api/v1/admin/promotions/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

### 12.3 List Promotions

- **Endpoint:** `GET /api/v1/admin/promotions`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Query Params

| Param | Type | Required | Description |
|---|---|:---:|---|
| `page` | integer | — | Default: 0 |
| `size` | integer | — | Default: 20 |
| `sort` | string | — | Default: `createdAt` |
| `direction` | string | — | `asc` or `desc`. Default: `desc` |

> **NOT FOUND IN CODE:** PromotionFilter fields not read. Verify with source DTO.

### 12.4 Update Promotion

- **Endpoint:** `PATCH /api/v1/admin/promotions/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

### 12.5 Delete Promotion (Soft)

- **Endpoint:** `DELETE /api/v1/admin/promotions/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`
- Returns HTTP 204 (no content body but wrapped in `ApiResponse`).

### 12.6 Add Rule to Promotion

- **Endpoint:** `POST /api/v1/admin/promotions/{id}/rules`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

> **NOT FOUND IN CODE:** Full AddRuleRequest DTO fields not read. Expected: `ruleType`, `ruleValue`. Verify with source DTO.

### 12.7 Remove Rule from Promotion

- **Endpoint:** `DELETE /api/v1/admin/promotions/{id}/rules/{ruleId}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

---

## 13. Voucher Management

### 13.1 List Vouchers

- **Endpoint:** `GET /api/v1/admin/vouchers`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

> **NOT FOUND IN CODE:** VoucherFilter fields not read. Verify with source DTO.

### 13.2 Get Voucher by ID

- **Endpoint:** `GET /api/v1/admin/vouchers/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 13.3 Get Voucher by Code

- **Endpoint:** `GET /api/v1/admin/vouchers/code/{code}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 13.4 Get Voucher Usage History

- **Endpoint:** `GET /api/v1/admin/vouchers/{id}/usages`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

Returns paginated `VoucherUsageResponse`.

> **NOT FOUND IN CODE:** Full VoucherUsageResponse fields not read. Verify with source DTO.

### 13.5 Create Voucher

- **Endpoint:** `POST /api/v1/admin/vouchers`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

#### Request Body

```json
{
  "code": "SALE20",
  "promotionId": 1,
  "usageLimit": 500,
  "usageLimitPerUser": 1,
  "startDate": "2026-06-01T00:00:00",
  "endDate": "2026-06-30T23:59:59"
}
```

| Field | Type | Required | Nullable | Validation | Description |
|---|---|:---:|:---:|---|---|
| `code` | string | — | Yes | max 100 | Leave blank to auto-generate |
| `promotionId` | long | ✓ | No | existing promotion | Linked promotion |
| `usageLimit` | integer | — | Yes | >= 1 | Total redemption cap (null = unlimited) |
| `usageLimitPerUser` | integer | — | Yes | >= 1 | Per-customer cap (null = unlimited) |
| `startDate` | datetime | ✓ | No | ISO-8601 | Activation date |
| `endDate` | datetime | ✓ | No | ISO-8601 | Expiry date |

#### Response (201) — `VoucherResponse`

```json
{
  "data": {
    "id": 1,
    "code": "SALE20",
    "promotionId": 1,
    "promotionName": "Summer Sale 2026",
    "discountType": "PERCENTAGE",
    "discountValue": 20.00,
    "maxDiscountAmount": 100000.00,
    "minimumOrderAmount": 200000.00,
    "usageLimit": 500,
    "usageCount": 0,
    "usageLimitPerUser": 1,
    "startDate": "2026-06-01T00:00:00",
    "endDate": "2026-06-30T23:59:59",
    "active": true,
    "createdAt": "2026-04-19T08:00:00Z"
  }
}
```

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 409 | `VOUCHER_CODE_ALREADY_EXISTS` | Code already in use |
| 404 | `PROMOTION_NOT_FOUND` | Promotion not found |

### 13.6 Update Voucher

- **Endpoint:** `PATCH /api/v1/admin/vouchers/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

> **NOT FOUND IN CODE:** Full UpdateVoucherRequest DTO fields not read. Verify with source DTO.

### 13.7 Delete Voucher (Soft)

- **Endpoint:** `DELETE /api/v1/admin/vouchers/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

---

## 14. Review Moderation

### 14.1 Get Pending Reviews

- **Endpoint:** `GET /api/v1/reviews/pending`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`
- **Note:** This endpoint is not under `/admin/**` path.

#### Response (200) — Paginated `ReviewResponse`

```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "customerId": 5,
        "customerName": "Nguyen Van Loc",
        "productId": 1,
        "productName": "Áo thun basic nam",
        "variantId": 1,
        "variantName": "Trắng / M",
        "sku": "ATBN-WH-M",
        "orderItemId": 1,
        "rating": 5,
        "comment": "Sản phẩm rất tốt",
        "status": "PENDING",
        "adminNote": null,
        "moderatedAt": null,
        "moderatedBy": null,
        "createdAt": "2026-04-19T08:00:00Z"
      }
    ],
    ...pagination fields
  }
}
```

### 14.2 Get Review by ID

- **Endpoint:** `GET /api/v1/reviews/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

### 14.3 Moderate Review (Approve / Reject)

- **Endpoint:** `PATCH /api/v1/reviews/{id}/moderate`
- **Auth:** Bearer Token
- **Allowed roles:** `STAFF`, `ADMIN`, `SUPER_ADMIN`

> **NOT FOUND IN CODE:** Full ModerateReviewRequest DTO fields not read. Expected: `status` (APPROVED/REJECTED), `adminNote`. Verify with source DTO.

#### Response (ERROR)

| HTTP | Code | When |
|---|---|---|
| 409 | `REVIEW_ALREADY_MODERATED` | Review already moderated |
| 404 | `REVIEW_NOT_FOUND` | Review not found |

### 14.4 Delete Review (Soft)

- **Endpoint:** `DELETE /api/v1/reviews/{id}`
- **Auth:** Bearer Token
- **Allowed roles:** `ADMIN`, `SUPER_ADMIN`

---

## 15. Missing Admin Endpoints

The following admin features are **not yet implemented** in the codebase:

| Feature | Missing API |
|---|---|
| Customer management | `GET /api/v1/admin/customers` — list/search customers |
| Customer detail | `GET /api/v1/admin/customers/{id}` |
| Customer disable | `PATCH /api/v1/admin/customers/{id}/status` |
| Admin user list | `GET /api/v1/admin/users` |
| Admin user get | `GET /api/v1/admin/users/{id}` |
| Admin user disable | `PATCH /api/v1/admin/users/{id}/status` |
| Product media upload | `POST /api/v1/admin/products/{id}/media` |
| Product media delete | `DELETE /api/v1/admin/products/{id}/media/{mediaId}` |
| Refund management | `POST /api/v1/admin/payments/{id}/refund` |
| Dashboard / reports | `GET /api/v1/admin/dashboard/**` |
| CMS / banners | `GET/POST/PATCH/DELETE /api/v1/admin/banners` |
| Loyalty points management | Not scoped yet |
