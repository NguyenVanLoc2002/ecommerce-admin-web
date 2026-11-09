import { describe, expect, it } from 'vitest';
import { carrierConfigSchema } from '../schemas/carrierConfigSchema';

describe('carrierConfigSchema', () => {
  it('keeps secret inputs write-only and normalizes supported fields', () => {
    const result = carrierConfigSchema.parse({
      apiKey: '   ',
      secretKey: '',
      webhookSecret: undefined,
      baseUrl: ' https://api.example.com ',
      enabled: true,
    });

    expect(result).toEqual({
      apiKey: null,
      secretKey: null,
      webhookSecret: null,
      baseUrl: 'https://api.example.com',
      enabled: true,
    });
  });
});
