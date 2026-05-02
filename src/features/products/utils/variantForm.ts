import type { CreateVariantRequest, ProductVariant, VariantAttributeDefinition } from '../types/product.types';
import type { VariantFormValues } from '../schemas/variantSchema';

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function buildVariantNamePreview(
  attributes: VariantAttributeDefinition[],
  attributeValueIds: string[],
): string {
  const selectedValueIds = new Set(attributeValueIds);

  return attributes
    .map((attribute) =>
      attribute.values.find((value) => selectedValueIds.has(value.id)),
    )
    .filter((value): value is NonNullable<typeof value> => value !== undefined)
    .map((value) => value.displayValue ?? value.value)
    .join(' / ');
}

export function getSelectableVariantAttributes(
  attributes: VariantAttributeDefinition[],
): VariantAttributeDefinition[] {
  return attributes
    .filter((attribute) => attribute.isDeleted !== true)
    .map((attribute) => ({
      ...attribute,
      values: attribute.values.filter((value) => value.isDeleted !== true),
    }))
    .filter((attribute) => attribute.values.length > 0);
}

export function buildVariantPayload(values: VariantFormValues): CreateVariantRequest {
  return {
    sku: values.autoGenerateSku ? null : normalizeOptionalText(values.sku),
    autoGenerateSku: values.autoGenerateSku,
    barcode: values.autoGenerateBarcode ? null : normalizeOptionalText(values.barcode),
    autoGenerateBarcode: values.autoGenerateBarcode,
    variantName: values.autoGenerateVariantName
      ? null
      : normalizeOptionalText(values.variantName),
    autoGenerateVariantName: values.autoGenerateVariantName,
    basePrice: values.basePrice,
    salePrice: values.salePrice,
    compareAtPrice: values.compareAtPrice,
    weightGram: values.weightGram,
    status: values.status,
    attributeValueIds: values.attributeValueIds,
  };
}

export function matchesGeneratedVariantName(
  variant: ProductVariant | undefined,
  attributes: VariantAttributeDefinition[],
): boolean {
  if (!variant) {
    return false;
  }

  const preview = buildVariantNamePreview(
    attributes,
    variant.attributes.map((attribute) => attribute.valueId),
  );

  return preview.length > 0 && preview.trim() === variant.variantName.trim();
}
