import { describe, expect, it } from 'vitest';
import { carrierSchema } from '../schemas/carrierSchema';

describe('carrierSchema', () => {
  it('trims create and edit form values into the backend payload shape', () => {
    const result = carrierSchema.parse({
      code: ' GHN_MAIN ',
      name: ' Giao Hang Nhanh ',
      providerType: 'GHN',
      status: 'ACTIVE',
      logoUrl: ' https://cdn.example.com/ghn.svg ',
      description: ' Primary checkout carrier ',
    });

    expect(result).toEqual({
      code: 'GHN_MAIN',
      name: 'Giao Hang Nhanh',
      providerType: 'GHN',
      status: 'ACTIVE',
      logoUrl: 'https://cdn.example.com/ghn.svg',
      description: 'Primary checkout carrier',
    });
  });
});
