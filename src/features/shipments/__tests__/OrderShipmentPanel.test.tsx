import { renderToStaticMarkup } from 'react-dom/server';
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
});
