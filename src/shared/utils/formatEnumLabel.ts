export function formatEnumLabel(value: string | null | undefined, fallback = 'Unknown') {
  if (!value) {
    return fallback;
  }

  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
