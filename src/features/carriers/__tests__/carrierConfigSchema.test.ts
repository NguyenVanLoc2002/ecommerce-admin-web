import { describe, expect, it } from 'vitest';
import { carrierConfigSchema } from '../schemas/carrierConfigSchema';

describe('carrierConfigSchema', () => {
  it('keeps secret inputs write-only by turning blank values into null', () => {
    const result = carrierConfigSchema.parse({
      apiKey: '   ',
      secretKey: '',
      webhookSecret: undefined,
      baseUrl: ' https://api.example.com ',
      enabled: true,
      configJson: ' {"shopId":"abc"} ',
    });

    expect(result).toEqual({
      apiKey: null,
      secretKey: null,
      webhookSecret: null,
      baseUrl: 'https://api.example.com',
      enabled: true,
      configJson: '{"shopId":"abc"}',
    });
  });

  it('rejects invalid config JSON before submission', () => {
    const result = carrierConfigSchema.safeParse({
      apiKey: null,
      secretKey: null,
      webhookSecret: null,
      baseUrl: null,
      enabled: false,
      configJson: '{invalid',
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.configJson).toContain('Config JSON must be valid JSON');
  });
});
