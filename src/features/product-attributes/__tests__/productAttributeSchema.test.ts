import { describe, expect, it } from 'vitest';
import { productAttributeSchema } from '../schemas/productAttributeSchema';

describe('productAttributeSchema', () => {
  it('rejects duplicate values within the same attribute', () => {
    const result = productAttributeSchema.safeParse({
      name: 'Color',
      code: 'COLOR',
      type: 'VARIANT',
      values: [
        { value: 'WHITE', displayValue: 'White' },
        { value: 'white', displayValue: 'White duplicate' },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message === 'Duplicate values are not allowed')).toBe(true);
  });

  it('accepts distinct values', () => {
    const result = productAttributeSchema.safeParse({
      name: 'Size',
      code: 'SIZE',
      type: 'VARIANT',
      values: [
        { value: 'S', displayValue: 'S' },
        { value: 'M', displayValue: 'M' },
      ],
    });

    expect(result.success).toBe(true);
  });
});
