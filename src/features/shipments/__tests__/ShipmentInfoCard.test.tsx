import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ShipmentInfoCard } from '../components/ShipmentInfoCard';

describe('ShipmentInfoCard', () => {
  it('renders provider status and tracking URL safely', () => {
    const markup = renderToStaticMarkup(
      <ShipmentInfoCard
        shipment={{
          id: 'shipment-1',
          orderId: 'order-1',
          orderCode: 'ORD-1',
          shipmentCode: 'SHP-1',
          customer: {
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            phone: '0912345678',
          },
          shippingAddress: {
            fullName: 'Jane Doe',
            phone: '0912345678',
            street: '1 Nguyen Hue',
            ward: 'Ben Nghe',
            district: 'District 1',
            province: 'HCM',
          },
          carrierId: 'carrier-1',
          carrier: 'Giao Hang Nhanh',
          carrierCode: 'GHN_MAIN',
          carrierProviderType: 'GHN',
          carrierShipmentId: 'GHN-123',
          trackingNumber: 'TRACK-1',
          providerStatus: 'READY_TO_PICK',
          providerTrackingUrl: 'https://tracking.example.com/TRACK-1',
          status: 'PENDING',
          estimatedDeliveryDate: '2026-05-20',
          shippedAt: null,
          deliveredAt: null,
          shippingFee: 25000,
          note: null,
          events: [],
          createdAt: '2026-05-15T08:00:00Z',
          updatedAt: '2026-05-15T08:00:00Z',
        }}
      />,
    );

    expect(markup).toContain('Provider Status');
    expect(markup).toContain('READY_TO_PICK');
    expect(markup).toContain('Open tracking');
    expect(markup).toContain('href="https://tracking.example.com/TRACK-1"');
  });
});
