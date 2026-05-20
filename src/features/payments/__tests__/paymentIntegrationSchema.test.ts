import { describe, expect, it } from 'vitest';
import {
  momoPaymentIntegrationSchema,
  paypalPaymentIntegrationSchema,
} from '../schemas/paymentIntegrationSchema';
import {
  buildMomoIntegrationPayload,
  buildPaypalIntegrationPayload,
} from '../utils/paymentIntegrationForm';

describe('payment integration form helpers', () => {
  it('keeps unchanged MoMo secrets out of the payload even when the input stays blank', () => {
    const values = momoPaymentIntegrationSchema.parse({
      enabled: true,
      environment: 'test',
      partnerCode: '',
      clearPartnerCode: false,
      accessKey: '',
      clearAccessKey: false,
      secretKey: '',
      clearSecretKey: false,
      createUrl: 'https://test-payment.momo.vn/create',
      redirectUrl: '',
      ipnUrl: '',
      requestType: '',
      lang: '',
      connectTimeoutMs: '15000',
      readTimeoutMs: '',
    });

    const payload = buildMomoIntegrationPayload(values, {
      enabled: true,
      environment: true,
      partnerCode: true,
      createUrl: true,
      connectTimeoutMs: true,
    });

    expect(payload).toEqual({
      enabled: true,
      environment: 'test',
      createUrl: 'https://test-payment.momo.vn/create',
      connectTimeoutMs: 15000,
    });
  });

  it('sends an explicit blank secret when clearing a stored MoMo override', () => {
    const values = momoPaymentIntegrationSchema.parse({
      enabled: false,
      environment: '',
      partnerCode: '',
      clearPartnerCode: true,
      accessKey: '',
      clearAccessKey: false,
      secretKey: '',
      clearSecretKey: false,
      createUrl: '',
      redirectUrl: '',
      ipnUrl: '',
      requestType: '',
      lang: '',
      connectTimeoutMs: '',
      readTimeoutMs: '',
    });

    const payload = buildMomoIntegrationPayload(values, {
      clearPartnerCode: true,
    });

    expect(payload).toEqual({
      partnerCode: '',
    });
  });

  it('converts dirty PayPal numeric overrides and preserves secret replacement intent', () => {
    const values = paypalPaymentIntegrationSchema.parse({
      enabled: true,
      environment: 'sandbox',
      clientId: 'new-client-id',
      clearClientId: false,
      clientSecret: '',
      clearClientSecret: false,
      baseUrl: 'https://api-m.sandbox.paypal.com',
      returnUrl: '',
      cancelUrl: '',
      webhookId: '',
      currency: 'USD',
      brandName: '',
      locale: '',
      userAction: '',
      paymentMethodPreference: '',
      shippingPreference: '',
      testConversionEnabled: true,
      testConversionRateVndToUsd: '26000',
      connectTimeoutMs: '',
      readTimeoutMs: '18000',
    });

    const payload = buildPaypalIntegrationPayload(values, {
      clientId: true,
      baseUrl: true,
      currency: true,
      testConversionEnabled: true,
      testConversionRateVndToUsd: true,
      readTimeoutMs: true,
    });

    expect(payload).toEqual({
      clientId: 'new-client-id',
      baseUrl: 'https://api-m.sandbox.paypal.com',
      currency: 'USD',
      testConversionEnabled: true,
      testConversionRateVndToUsd: 26000,
      readTimeoutMs: 18000,
    });
  });

  it('rejects invalid URLs and non-positive timeout values', () => {
    const result = paypalPaymentIntegrationSchema.safeParse({
      enabled: false,
      environment: '',
      clientId: '',
      clearClientId: false,
      clientSecret: '',
      clearClientSecret: false,
      baseUrl: 'not-a-url',
      returnUrl: '',
      cancelUrl: '',
      webhookId: '',
      currency: '',
      brandName: '',
      locale: '',
      userAction: '',
      paymentMethodPreference: '',
      shippingPreference: '',
      testConversionEnabled: false,
      testConversionRateVndToUsd: '',
      connectTimeoutMs: '0',
      readTimeoutMs: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain('Must be a valid URL');
      expect(messages).toContain('Connect timeout must be greater than 0');
    }
  });
});
