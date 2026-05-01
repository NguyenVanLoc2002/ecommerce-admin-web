import { describe, expect, it } from 'vitest';
import {
  buildVariantNamePreview,
  buildVariantPayload,
  getSelectableVariantAttributes,
} from '../utils/variantForm';

describe('variantForm utilities', () => {
  const attributes = [
    {
      id: 'color',
      name: 'Color',
      code: 'COLOR',
      type: 'VARIANT' as const,
      createdAt: '',
      updatedAt: '',
      values: [
        { id: 'white', value: 'WHITE', displayValue: 'White' },
        { id: 'black', value: 'BLACK', displayValue: 'Black' },
      ],
    },
    {
      id: 'size',
      name: 'Size',
      code: 'SIZE',
      type: 'VARIANT' as const,
      createdAt: '',
      updatedAt: '',
      values: [
        { id: 'm', value: 'M', displayValue: 'M' },
        { id: 'l', value: 'L', displayValue: 'L' },
      ],
    },
  ];

  it('builds a variant name preview from selected attribute values', () => {
    expect(buildVariantNamePreview(attributes, ['white', 'm'])).toBe('White / M');
  });

  it('builds the backend payload with attributeValueIds and auto flags', () => {
    expect(
      buildVariantPayload({
        sku: '',
        autoGenerateSku: true,
        barcode: '  ',
        autoGenerateBarcode: false,
        variantName: 'White / M',
        autoGenerateVariantName: true,
        basePrice: 120000,
        salePrice: 90000,
        compareAtPrice: 140000,
        weightGram: 250,
        status: 'ACTIVE',
        attributeValueIds: ['white', 'm'],
      }),
    ).toEqual({
      sku: null,
      autoGenerateSku: true,
      barcode: null,
      autoGenerateBarcode: false,
      variantName: null,
      autoGenerateVariantName: true,
      basePrice: 120000,
      salePrice: 90000,
      compareAtPrice: 140000,
      weightGram: 250,
      status: 'ACTIVE',
      attributeValueIds: ['white', 'm'],
    });
  });

  it('filters deleted attributes and deleted attribute values out of selectable options', () => {
    expect(
      getSelectableVariantAttributes([
        {
          id: 'color',
          name: 'Color',
          code: 'COLOR',
          type: 'VARIANT',
          createdAt: '',
          updatedAt: '',
          values: [
            { id: 'white', value: 'WHITE', displayValue: 'White' },
            { id: 'black', value: 'BLACK', displayValue: 'Black', isDeleted: true },
          ],
        },
        {
          id: 'material',
          name: 'Material',
          code: 'MATERIAL',
          type: 'VARIANT',
          createdAt: '',
          updatedAt: '',
          isDeleted: true,
          values: [{ id: 'cotton', value: 'COTTON', displayValue: 'Cotton' }],
        },
      ]),
    ).toEqual([
      {
        id: 'color',
        name: 'Color',
        code: 'COLOR',
        type: 'VARIANT',
        createdAt: '',
        updatedAt: '',
        values: [{ id: 'white', value: 'WHITE', displayValue: 'White' }],
      },
    ]);
  });
});
