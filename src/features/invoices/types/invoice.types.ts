import type { InvoiceStatus } from '@/shared/types/enums';

export type { InvoiceStatus };

export interface InvoiceLineItem {
  id: number;
  variantId: number;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: number;
  invoiceCode: string;
  orderId: number;
  orderCode: string;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt: string | null;
  voidedAt: string | null;
  voidNote: string | null;
  receiverName: string;
  receiverPhone: string;
  shippingStreet: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListParams {
  invoiceCode?: string;
  orderCode?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  size: number;
  sort?: string;
  direction?: string;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus;
  notes?: string;
}
