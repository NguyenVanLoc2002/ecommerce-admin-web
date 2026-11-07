import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { AhamoveIntegrationDrawer } from '../components/AhamoveIntegrationDrawer';
import type { AhamoveIntegration, Carrier } from '../types/carrier.types';

const integration: AhamoveIntegration = {
  carrierId: 'carrier-1',
  carrierCode: 'AHAMOVE',
  carrierName: 'AhaMove',
  enabled: true,
  baseUrl: 'https://partner-apistg.ahamove.com',
  hasApiKey: true,
  hasSecretKey: true,
  hasWebhookSecret: false,
  phone: '84338710667',
  brandName: 'Locen Studio',
  pickupWarehouseId: 'warehouse-1',
  pickupAddress: null,
  pickupShortAddress: null,
  pickupName: null,
  pickupPhone: null,
  pickupLat: null,
  pickupLng: null,
  defaultServiceCode: 'BIKE',
  defaultPaymentMethod: 'CASH',
  connectionStatus: null,
  lastHealthCheckAt: null,
  lastHealthCheckError: null,
  maskedWebhookToken: null,
  quoteReady: false,
  quoteVerified: false,
  missingQuoteFields: ['pickupWarehouse'],
};

vi.mock('../hooks/useAhamoveIntegration', () => ({
  useAhamoveIntegration: () => ({ data: integration, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock('../hooks/useAhamoveWebhookSetup', () => ({
  useAhamoveWebhookSetup: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock('../hooks/useUpdateAhamoveIntegration', () => ({
  useUpdateAhamoveIntegration: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock('../hooks/useTestAhamoveConnection', () => ({
  useTestAhamoveConnection: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock('../hooks/useGenerateAhamoveWebhookToken', () => ({
  useGenerateAhamoveWebhookToken: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock('@/shared/hooks/useActiveWarehouseOptions', () => ({
  useActiveWarehouseOptions: () => ({
    data: [{ id: 'warehouse-1', name: 'Main warehouse', code: 'MAIN-01' }],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

const carrier: Carrier = {
  id: 'carrier-1',
  code: 'AHAMOVE',
  name: 'AhaMove',
  providerType: 'AHAMOVE',
  status: 'ACTIVE',
  logoUrl: null,
  description: null,
  configEnabled: true,
  baseUrl: null,
  hasApiKey: true,
  hasSecretKey: true,
  hasWebhookSecret: false,
  configJson: null,
  connectionStatus: null,
  lastHealthCheckAt: null,
  lastHealthCheckError: null,
  createdAt: '',
  updatedAt: '',
};

describe('AhamoveIntegrationDrawer', () => {
  it('renders a managed warehouse selector before the labelled legacy migration fallback', () => {
    const markup = renderToStaticMarkup(
      <AhamoveIntegrationDrawer open onClose={vi.fn()} carrier={carrier} inline />,
    );

    expect(markup).toContain('Managed pickup warehouse');
    expect(markup).toContain('Main warehouse (MAIN-01)');
    expect(markup).toContain('Legacy pickup migration fallback');
    expect(markup).toContain('selected managed pickup warehouse is inactive or its pickup profile is incomplete');
  });
});
