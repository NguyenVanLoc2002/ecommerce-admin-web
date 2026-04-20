import { Badge } from './Badge';
import type {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  InvoiceStatus,
  ReviewStatus,
  ProductStatus,
  VariantStatus,
  EntityStatus,
} from '@/shared/types/enums';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

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
};

const shipmentStatusMap: Record<ShipmentStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
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

type StatusBadgeProps =
  | { type: 'order'; status: OrderStatus }
  | { type: 'payment'; status: PaymentStatus }
  | { type: 'shipment'; status: ShipmentStatus }
  | { type: 'invoice'; status: InvoiceStatus }
  | { type: 'review'; status: ReviewStatus }
  | { type: 'product'; status: ProductStatus }
  | { type: 'variant'; status: VariantStatus }
  | { type: 'entity'; status: EntityStatus };

export function StatusBadge(props: StatusBadgeProps) {
  let label: string;
  let variant: BadgeVariant;

  switch (props.type) {
    case 'order': {
      const m = orderStatusMap[props.status];
      label = m.label;
      variant = m.variant;
      break;
    }
    case 'payment': {
      const m = paymentStatusMap[props.status];
      label = m.label;
      variant = m.variant;
      break;
    }
    case 'shipment': {
      const m = shipmentStatusMap[props.status];
      label = m.label;
      variant = m.variant;
      break;
    }
    case 'invoice': {
      const m = invoiceStatusMap[props.status];
      label = m.label;
      variant = m.variant;
      break;
    }
    case 'review': {
      const m = reviewStatusMap[props.status];
      label = m.label;
      variant = m.variant;
      break;
    }
    case 'product': {
      const m = productStatusMap[props.status];
      label = m.label;
      variant = m.variant;
      break;
    }
    case 'variant': {
      const m = variantStatusMap[props.status];
      label = m.label;
      variant = m.variant;
      break;
    }
    case 'entity': {
      const m = entityStatusMap[props.status];
      label = m.label;
      variant = m.variant;
      break;
    }
  }

  return <Badge variant={variant} dot>{label}</Badge>;
}
