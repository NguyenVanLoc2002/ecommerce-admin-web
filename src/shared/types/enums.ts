export const OrderStatus = {
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// Status on the Order entity's paymentStatus field
export const OrderPaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderPaymentStatus = (typeof OrderPaymentStatus)[keyof typeof OrderPaymentStatus];

// Status on the Payment record entity
export const PaymentStatus = {
  PENDING: 'PENDING',
  INITIATED: 'INITIATED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  COD: 'COD',
  ONLINE: 'ONLINE',
  MOMO: 'MOMO',
  ZALO_PAY: 'ZALO_PAY',
  VNPAY: 'VNPAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ShipmentStatus = {
  PENDING: 'PENDING',
  PICKING: 'PICKING',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETURNED: 'RETURNED',
} as const;
export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const InvoiceStatus = {
  ISSUED: 'ISSUED',
  PAID: 'PAID',
  VOIDED: 'VOIDED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export const ProductStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  INACTIVE: 'INACTIVE',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const VariantStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type VariantStatus = (typeof VariantStatus)[keyof typeof VariantStatus];

export const StockMovementType = {
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  ADJUSTMENT: 'ADJUSTMENT',
  RETURN: 'RETURN',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export const AuditAction = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  USER_REGISTERED: 'USER_REGISTERED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DISABLED: 'USER_DISABLED',
  USER_ENABLED: 'USER_ENABLED',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_PUBLISHED: 'PRODUCT_PUBLISHED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  CATEGORY_DELETED: 'CATEGORY_DELETED',
  BRAND_CREATED: 'BRAND_CREATED',
  BRAND_UPDATED: 'BRAND_UPDATED',
  BRAND_DELETED: 'BRAND_DELETED',
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_PROCESSING: 'ORDER_PROCESSING',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_COD_COMPLETED: 'PAYMENT_COD_COMPLETED',
  PAYMENT_CALLBACK_SUCCESS: 'PAYMENT_CALLBACK_SUCCESS',
  PAYMENT_CALLBACK_FAILED: 'PAYMENT_CALLBACK_FAILED',
  INVENTORY_ADJUSTED: 'INVENTORY_ADJUSTED',
  PROMOTION_CREATED: 'PROMOTION_CREATED',
  PROMOTION_UPDATED: 'PROMOTION_UPDATED',
  PROMOTION_DELETED: 'PROMOTION_DELETED',
  VOUCHER_CREATED: 'VOUCHER_CREATED',
  VOUCHER_UPDATED: 'VOUCHER_UPDATED',
  VOUCHER_APPLIED: 'VOUCHER_APPLIED',
  VOUCHER_RELEASED: 'VOUCHER_RELEASED',
  SHIPMENT_CREATED: 'SHIPMENT_CREATED',
  SHIPMENT_STATUS_UPDATED: 'SHIPMENT_STATUS_UPDATED',
  INVOICE_GENERATED: 'INVOICE_GENERATED',
  INVOICE_STATUS_UPDATED: 'INVOICE_STATUS_UPDATED',
  REVIEW_SUBMITTED: 'REVIEW_SUBMITTED',
  REVIEW_APPROVED: 'REVIEW_APPROVED',
  REVIEW_REJECTED: 'REVIEW_REJECTED',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const PromotionScope = {
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  CATEGORY: 'CATEGORY',
  BRAND: 'BRAND',
  SHIPPING: 'SHIPPING',
} as const;
export type PromotionScope = (typeof PromotionScope)[keyof typeof PromotionScope];

export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const PromotionRuleType = {
  MIN_ORDER_AMOUNT: 'MIN_ORDER_AMOUNT',
  SPECIFIC_PRODUCTS: 'SPECIFIC_PRODUCTS',
  SPECIFIC_CATEGORIES: 'SPECIFIC_CATEGORIES',
  SPECIFIC_BRANDS: 'SPECIFIC_BRANDS',
  FIRST_ORDER: 'FIRST_ORDER',
} as const;
export type PromotionRuleType = (typeof PromotionRuleType)[keyof typeof PromotionRuleType];

export const EntityStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type EntityStatus = (typeof EntityStatus)[keyof typeof EntityStatus];
