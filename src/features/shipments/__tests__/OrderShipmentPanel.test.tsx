import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { OrderShipmentPanel } from '../components/OrderShipmentPanel';

const { useShipmentByOrderMock } = vi.hoisted(() => ({ useShipmentByOrderMock: vi.fn() }));

vi.mock('../hooks/useShipmentByOrder', () => ({ useShipmentByOrder: useShipmentByOrderMock }));

describe('OrderShipmentPanel', () => {
  it('explains that shipment history is unavailable before shipment creation', () => {
    useShipmentByOrderMock.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: vi.fn() });

    const markup = renderToStaticMarkup(<OrderShipmentPanel orderId="order-1" shippingFee={25000} />);

    expect(markup).toContain('No shipment yet');
    expect(markup).toContain('Shipment events will appear here');
  });

  it.each([
    ['FAILED', 'Delivery failed.'],
    ['RETURNED', 'The carrier shipment was returned.'],
  ])('links a %s shipment to its exception details', (status, message) => {
    useShipmentByOrderMock.mockReturnValue({
      data: { id: 'shipment-1', status, events: [], estimatedCarrierCost: null, carrierCost: null },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <OrderShipmentPanel orderId="order-1" shippingFee={25000} />
      </MemoryRouter>,
    );

    expect(markup).toContain('href="/shipments/shipment-1"');
    expect(markup).toContain('Review shipment exception');
    expect(markup).toContain('role="status"');
    expect(markup).toContain(message);
  });
});
