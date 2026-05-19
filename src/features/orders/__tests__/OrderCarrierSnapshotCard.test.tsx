import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OrderCarrierSnapshotCard } from '../components/OrderCarrierSnapshotCard';

describe('OrderCarrierSnapshotCard', () => {
  it('renders the checkout carrier snapshot when present', () => {
    const markup = renderToStaticMarkup(
      <OrderCarrierSnapshotCard
        order={{
          id: 'order-1',
          orderCode: 'ORD-1001',
          customerId: 'customer-1',
          status: 'CONFIRMED',
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          receiverName: 'Jane Doe',
          receiverPhone: '0912345678',
          shippingStreet: '1 Nguyen Hue',
          shippingWard: 'Ben Nghe',
          shippingDistrict: 'District 1',
          shippingCity: 'HCM',
          shippingPostalCode: null,
          carrierId: 'carrier-1',
          carrierCode: 'GHN_MAIN',
          carrierName: 'Giao Hang Nhanh',
          carrierProviderType: 'GHN',
          subTotal: 100000,
          discountAmount: 0,
          shippingFee: 25000,
          totalAmount: 125000,
          voucherCode: null,
          customerNote: null,
          items: [],
          createdAt: '2026-05-15T08:00:00Z',
          updatedAt: '2026-05-15T08:00:00Z',
        }}
        onCreateShipment={() => {}}
      />,
    );

    expect(markup).toContain('Checkout Carrier');
    expect(markup).toContain('Giao Hang Nhanh');
    expect(markup).toContain('GHN_MAIN');
    expect(markup).toContain('Create shipment with checkout carrier');
  });
});
