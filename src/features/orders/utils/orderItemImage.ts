import { resolveImageUrl } from '@/shared/utils/imageUrl';
import type { OrderItem, OrderItemMedia } from '../types/order.types';

type RecordLike = Record<string, unknown>;

const DIRECT_IMAGE_FIELDS = [
  'imageUrl',
  'productImageUrl',
  'variantPrimaryImageUrl',
  'variantMediaUrl',
  'variantImageUrl',
  'productPrimaryImageUrl',
  'primaryMediaUrl',
  'productImage',
  'thumbnailUrl',
] as const;

export function getOrderItemImage(item: OrderItem): string | null {
  const record = item as unknown as RecordLike;

  for (const field of DIRECT_IMAGE_FIELDS) {
    const value = asNullableString(record[field]);
    const resolved = resolveImageUrl(value);
    if (resolved) {
      return resolved;
    }
  }

  return resolveImageUrl(selectMediaUrl(item.variantMedias))
    ?? resolveImageUrl(selectMediaUrl(item.productMedias));
}

export function normalizeOrderItemMediaList(input: unknown): OrderItemMedia[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => normalizeOrderItemMedia(entry))
    .filter((entry) => entry.mediaUrl.trim() && isImageMedia(entry));
}

function normalizeOrderItemMedia(input: unknown): OrderItemMedia {
  const record = toRecord(input);

  return {
    id: asNullableString(record.id) ?? undefined,
    mediaUrl: asString(record.mediaUrl ?? record.media_url ?? record.url ?? record.imageUrl),
    mediaType: asNullableString(record.mediaType ?? record.media_type) ?? undefined,
    sortOrder: asNumber(record.sortOrder ?? record.sort_order) ?? undefined,
    primary: asBoolean(record.primary ?? record.isPrimary ?? record.is_primary) ?? undefined,
    variantId: asNullableString(record.variantId ?? record.variant_id),
  };
}

function selectMediaUrl(media: OrderItemMedia[] | undefined): string | null {
  const imageMedia = (media ?? []).filter(isImageMedia);

  if (imageMedia.length === 0) {
    return null;
  }

  const sorted = [...imageMedia].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return sorted.find((entry) => entry.primary)?.mediaUrl ?? sorted[0]?.mediaUrl ?? null;
}

function isImageMedia(media: OrderItemMedia): boolean {
  return !media.mediaType || media.mediaType === 'IMAGE';
}

function toRecord(value: unknown): RecordLike {
  return value !== null && typeof value === 'object'
    ? (value as RecordLike)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNullableString(value: unknown): string | null {
  return value == null || value === '' ? null : String(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}
