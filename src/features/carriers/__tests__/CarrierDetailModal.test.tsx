import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CarrierDetailModal } from '../components/CarrierDetailModal';
import type { Carrier } from '../types/carrier.types';

vi.mock('@/shared/components/ui/Modal', () => ({
  Modal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const carrier: Carrier = {
  id: 'carrier-1',
  code: 'AHAMOVE',
  name: 'AhaMove',
  providerType: 'AHAMOVE',
  status: 'ACTIVE',
  logoUrl: null,
  description: 'Same-day delivery',
  configEnabled: true,
  baseUrl: 'https://partner-apistg.ahamove.com',
  hasApiKey: true,
  hasSecretKey: true,
  hasWebhookSecret: true,
  connectionStatus: 'CONNECTED',
  lastHealthCheckAt: '2026-11-09T00:00:00Z',
  lastHealthCheckError: null,
  createdAt: '2026-11-09T00:00:00Z',
  updatedAt: '2026-11-09T00:00:00Z',
};

describe('CarrierDetailModal', () => {
  it('renders supported carrier details without a raw legacy debug section', () => {
    const markup = renderToStaticMarkup(
      <CarrierDetailModal open carrier={carrier} onClose={vi.fn()} onConfigure={vi.fn()} />,
    );

    expect(markup).toContain('Stored secrets');
    expect(markup).not.toContain('Advanced debug data');
    expect(markup).not.toContain('configJson');
  });
});
