import { beforeEach, describe, expect, it, vi } from 'vitest';
import { carrierService } from '../services/carrierService';

const { getMock, postMock, putMock, patchMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
  patchMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    put: putMock,
    patch: patchMock,
  },
}));

describe('carrierService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
    patchMock.mockReset();
    getMock.mockResolvedValue({ items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });
  });

  it('passes carrier list filters to the backend and preserves enabled=false', async () => {
    await carrierService.getList({
      page: 0,
      size: 20,
      sort: 'updatedAt,desc',
      keyword: ' ghn ',
      providerType: 'GHN',
      status: 'ACTIVE',
      enabled: false,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/carriers', {
      params: {
        page: 0,
        size: 20,
        sort: 'updatedAt,desc',
        keyword: 'ghn',
        providerType: 'GHN',
        status: 'ACTIVE',
        enabled: false,
      },
    });
  });

  it('loads active carrier options with the expected default paging and sorting', async () => {
    await carrierService.getActiveOptions();

    expect(getMock).toHaveBeenCalledWith('/admin/carriers', {
      params: {
        page: 0,
        size: 100,
        sort: 'name,asc',
        status: 'ACTIVE',
      },
    });
  });

  it('loads the typed AhaMove integration details', async () => {
    await carrierService.getAhamoveIntegration('carrier-1');

    expect(getMock).toHaveBeenCalledWith('/admin/carriers/carrier-1/integration/ahamove');
  });

  it('saves the typed AhaMove integration payload', async () => {
    await carrierService.updateAhamoveIntegration('carrier-1', {
      enabled: true,
      baseUrl: 'https://partner-apistg.ahamove.com',
      phone: '84338710667',
      pickupAddress: '123 Nguyen Hue',
      defaultServiceCode: 'BIKE',
    });

    expect(putMock).toHaveBeenCalledWith('/admin/carriers/carrier-1/integration/ahamove', {
      enabled: true,
      baseUrl: 'https://partner-apistg.ahamove.com',
      phone: '84338710667',
      pickupAddress: '123 Nguyen Hue',
      defaultServiceCode: 'BIKE',
    });
  });

  it('tests the AhaMove connection with optional overrides', async () => {
    await carrierService.testAhamoveConnection('carrier-1', {
      apiKey: 'temp-key',
      baseUrl: 'https://partner-apistg.ahamove.com',
      phone: '84338710667',
    });

    expect(postMock).toHaveBeenCalledWith(
      '/admin/carriers/carrier-1/integration/ahamove/test-connection',
      {
        apiKey: 'temp-key',
        baseUrl: 'https://partner-apistg.ahamove.com',
        phone: '84338710667',
      },
    );
  });

  it('requests webhook instructions and token rotation from the typed endpoints', async () => {
    await carrierService.getAhamoveWebhookSetup('carrier-1');
    await carrierService.generateAhamoveWebhookToken('carrier-1');

    expect(getMock).toHaveBeenCalledWith('/admin/carriers/carrier-1/integration/ahamove/webhook-setup');
    expect(postMock).toHaveBeenCalledWith('/admin/carriers/carrier-1/integration/ahamove/webhook-token');
  });
});
