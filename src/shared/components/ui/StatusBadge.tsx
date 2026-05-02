import { Badge } from './Badge';
import type {
  AuditAction,
  OrderStatus,
  OrderPaymentStatus,
  PaymentStatus,
  ShipmentStatus,
  InvoiceStatus,
  ReviewStatus,
  ProductStatus,
  VariantStatus,
  EntityStatus,
} from '@/shared/types/enums';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const softDeleteStatusMap = {
  ACTIVE: { label: 'Active', variant: 'success' as const },
  DELETED: { label: 'Deleted', variant: 'danger' as const },
};

const orderStatusMap: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'info' },
  PROCESSING: { label: 'Processing', variant: 'primary' },
  SHIPPED: { label: 'Shipped', variant: 'primary' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
  REFUNDED: { label: 'Refunded', variant: 'default' },
};

const paymentStatusMap: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  INITIATED: { label: 'Initiated', variant: 'info' },
  PAID: { label: 'Paid', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
  REFUNDED: { label: 'Refunded', variant: 'default' },
  PARTIALLY_REFUNDED: { label: 'Partially Refunded', variant: 'warning' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
};

const orderPaymentStatusMap: Record<OrderPaymentStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  PAID: { label: 'Paid', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
  REFUNDED: { label: 'Refunded', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
};

const shipmentStatusMap: Record<ShipmentStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  PICKING: { label: 'Picking', variant: 'info' },
  IN_TRANSIT: { label: 'In Transit', variant: 'primary' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', variant: 'info' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
  RETURNED: { label: 'Returned', variant: 'default' },
};

const invoiceStatusMap: Record<InvoiceStatus, { label: string; variant: BadgeVariant }> = {
  ISSUED: { label: 'Issued', variant: 'info' },
  PAID: { label: 'Paid', variant: 'success' },
  VOIDED: { label: 'Voided', variant: 'danger' },
};

const reviewStatusMap: Record<ReviewStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};

const productStatusMap: Record<ProductStatus, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'warning' },
};

const variantStatusMap: Record<VariantStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'default' },
};

const entityStatusMap: Record<EntityStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'default' },
};

const auditActionVariantMap: Record<AuditAction, BadgeVariant> = {
  LOGIN_SUCCESS: 'success',
  LOGIN_FAILURE: 'danger',
  LOGOUT: 'default',
  TOKEN_REFRESH: 'info',
  USER_REGISTERED: 'info',
  USER_CREATED: 'info',
  USER_UPDATED: 'primary',
  USER_DISABLED: 'danger',
  USER_ENABLED: 'success',
  PRODUCT_CREATED: 'info',
  PRODUCT_UPDATED: 'primary',
  PRODUCT_PUBLISHED: 'success',
  PRODUCT_DELETED: 'danger',
  CATEGORY_CREATED: 'info',
  CATEGORY_UPDATED: 'primary',
  CATEGORY_DELETED: 'danger',
  BRAND_CREATED: 'info',
  BRAND_UPDATED: 'primary',
  BRAND_DELETED: 'danger',
  ORDER_CREATED: 'info',
  ORDER_CONFIRMED: 'primary',
  ORDER_PROCESSING: 'primary',
  ORDER_SHIPPED: 'primary',
  ORDER_DELIVERED: 'success',
  ORDER_CANCELLED: 'danger',
  ORDER_COMPLETED: 'success',
  PAYMENT_CREATED: 'info',
  PAYMENT_COD_COMPLETED: 'success',
  PAYMENT_CALLBACK_SUCCESS: 'success',
  PAYMENT_CALLBACK_FAILED: 'danger',
  INVENTORY_ADJUSTED: 'warning',
  PROMOTION_CREATED: 'info',
  PROMOTION_UPDATED: 'primary',
  PROMOTION_DELETED: 'danger',
  VOUCHER_CREATED: 'info',
  VOUCHER_UPDATED: 'primary',
  VOUCHER_APPLIED: 'success',
  VOUCHER_RELEASED: 'warning',
  SHIPMENT_CREATED: 'info',
  SHIPMENT_STATUS_UPDATED: 'primary',
  INVOICE_GENERATED: 'info',
  INVOICE_STATUS_UPDATED: 'primary',
  REVIEW_SUBMITTED: 'info',
  REVIEW_APPROVED: 'success',
  REVIEW_REJECTED: 'danger',
};

type StatusBadgeProps =
  | { type: 'audit-action'; status: AuditAction | string | null | undefined }
  | { type: 'order'; status: OrderStatus | string | null | undefined }
  | { type: 'order-payment'; status: OrderPaymentStatus | string | null | undefined }
  | { type: 'payment'; status: PaymentStatus | string | null | undefined }
  | { type: 'shipment'; status: ShipmentStatus | string | null | undefined }
  | { type: 'invoice'; status: InvoiceStatus | string | null | undefined }
  | { type: 'review'; status: ReviewStatus | string | null | undefined }
  | { type: 'product'; status: ProductStatus | string | null | undefined }
  | { type: 'variant'; status: VariantStatus | string | null | undefined }
  | { type: 'entity'; status: EntityStatus | string | null | undefined }
  | { type: 'soft-delete'; status: boolean | 'ACTIVE' | 'DELETED' | string | null | undefined };

function fallbackStatus(status: string | null | undefined) {
  return {
    label: formatEnumLabel(status),
    variant: 'default' as const,
  };
}

function isAuditAction(status: string): status is AuditAction {
  return Object.prototype.hasOwnProperty.call(auditActionVariantMap, status);
}

export function StatusBadge(props: StatusBadgeProps) {
  let resolved: { label: string; variant: BadgeVariant };

  switch (props.type) {
    case 'audit-action': {
      if (typeof props.status === 'string' && isAuditAction(props.status)) {
        resolved = {
          label: formatEnumLabel(props.status),
          variant: auditActionVariantMap[props.status],
        };
      } else {
        resolved = fallbackStatus(props.status);
      }
      break;
    }
    case 'order': {
      resolved = orderStatusMap[props.status as OrderStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'order-payment': {
      resolved =
        orderPaymentStatusMap[props.status as OrderPaymentStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'payment': {
      resolved = paymentStatusMap[props.status as PaymentStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'shipment': {
      resolved = shipmentStatusMap[props.status as ShipmentStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'invoice': {
      resolved = invoiceStatusMap[props.status as InvoiceStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'review': {
      resolved = reviewStatusMap[props.status as ReviewStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'product': {
      resolved = productStatusMap[props.status as ProductStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'variant': {
      resolved = variantStatusMap[props.status as VariantStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'entity': {
      resolved = entityStatusMap[props.status as EntityStatus] ?? fallbackStatus(props.status);
      break;
    }
    case 'soft-delete': {
      const state =
        props.status === true
          ? 'DELETED'
          : props.status === false
            ? 'ACTIVE'
            : props.status;
      resolved =
        softDeleteStatusMap[state as keyof typeof softDeleteStatusMap] ?? fallbackStatus(state);
      break;
    }
  }

  return <Badge variant={resolved.variant} dot>{resolved.label}</Badge>;
}
