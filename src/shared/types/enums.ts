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

export const PaymentStatus = {
  PENDING: 'PENDING',
  INITIATED: 'INITIATED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  COD: 'COD',
  ONLINE: 'ONLINE',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ShipmentStatus = {
  PENDING: 'PENDING',
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
  ARCHIVED: 'ARCHIVED',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const VariantStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type VariantStatus = (typeof VariantStatus)[keyof typeof VariantStatus];

export const StockMovementType = {
  IMPORT: 'IMPORT',
  ADJUSTMENT: 'ADJUSTMENT',
  RESERVATION: 'RESERVATION',
  RELEASE: 'RELEASE',
  FULFILLMENT: 'FULFILLMENT',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export const AuditAction = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  STOCK_IMPORTED: 'STOCK_IMPORTED',
  STOCK_ADJUSTED: 'STOCK_ADJUSTED',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  VOUCHER_CREATED: 'VOUCHER_CREATED',
  VOUCHER_UPDATED: 'VOUCHER_UPDATED',
  VOUCHER_DELETED: 'VOUCHER_DELETED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  REVIEW_MODERATED: 'REVIEW_MODERATED',
  USER_DISABLED: 'USER_DISABLED',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const PromotionScope = {
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  CATEGORY: 'CATEGORY',
  BRAND: 'BRAND',
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

export const StockAdjustmentReason = {
  DAMAGE: 'DAMAGE',
  RETURN: 'RETURN',
  CORRECTION: 'CORRECTION',
  OTHER: 'OTHER',
} as const;
export type StockAdjustmentReason =
  (typeof StockAdjustmentReason)[keyof typeof StockAdjustmentReason];

export const EntityStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type EntityStatus = (typeof EntityStatus)[keyof typeof EntityStatus];
