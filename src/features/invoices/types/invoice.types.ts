import type { EntityId } from '@/shared/types/api.types';
import type { InvoiceStatus, OrderPaymentStatus, PaymentMethod } from '@/shared/types/enums';

export type { InvoiceStatus };

export interface InvoiceSummary {
  id: EntityId;
  invoiceCode: string;
  orderId: EntityId;
  orderCode: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string | null;
  paymentStatus: OrderPaymentStatus | null;
  paidAt: string | null;
  totalAmount: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  createdAt: string;
  notes: string | null;
}

export interface InvoiceLineItem {
  variantId: EntityId;
  productName: string;
  variantName: string | null;
  sku: string | null;
  unitPrice: number;
  salePrice: number | null;
  effectivePrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Invoice {
  id: EntityId;
  invoiceCode: string;
  orderId: EntityId;
  orderCode: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: OrderPaymentStatus | null;
  paidAt: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  billingStreet: string | null;
  billingWard: string | null;
  billingDistrict: string | null;
  billingCity: string | null;
  billingPostalCode: string | null;
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  voucherCode: string | null;
  lineItems: InvoiceLineItem[];
  createdAt: string;
}

export interface InvoiceListParams {
  invoiceCode?: string;
  orderCode?: string;
  status?: InvoiceStatus;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  size: number;
  sort?: string;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus;
  notes?: string;
}
