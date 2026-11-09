import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CarrierConfigModal } from '../components/CarrierConfigModal';
import type { Carrier } from '../types/carrier.types';

const carrier: Carrier = {
  id: 'carrier-1',
  code: 'GHN_MAIN',
  name: 'Giao Hang Nhanh',
  providerType: 'GHN',
  status: 'ACTIVE',
  logoUrl: null,
  description: null,
  configEnabled: true,
  baseUrl: 'https://api.ghn.vn',
  hasApiKey: true,
  hasSecretKey: true,
  hasWebhookSecret: false,
  connectionStatus: null,
  lastHealthCheckAt: null,
  lastHealthCheckError: null,
  createdAt: '2026-11-09T00:00:00Z',
  updatedAt: '2026-11-09T00:00:00Z',
};

describe('CarrierConfigModal', () => {
  it('shows supported settings without exposing a raw legacy configuration field', () => {
    const markup = renderToStaticMarkup(
      <CarrierConfigModal
        open
        inline
        carrier={carrier}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(markup).toContain('Raw legacy configuration is no longer shown or editable.');
    expect(markup).toContain('API Key');
    expect(markup).not.toContain('Config JSON');
    expect(markup).not.toContain('configJson');
  });
});
