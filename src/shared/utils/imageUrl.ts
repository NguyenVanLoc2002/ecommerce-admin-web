const API_PATH_PATTERN = /\/api(?:\/v\d+)?\/?$/;

export function resolveImageUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (
    /^(?:https?:)?\/\//i.test(trimmed)
    || trimmed.startsWith('data:')
    || trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const assetBaseUrl = getAssetBaseUrl(apiBaseUrl);
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  try {
    return new URL(normalizedPath, assetBaseUrl).toString();
  } catch {
    return normalizedPath;
  }
}

function getAssetBaseUrl(apiBaseUrl: string | undefined): string {
  if (!apiBaseUrl) {
    return getWindowOrigin();
  }

  try {
    const parsed = new URL(apiBaseUrl, getWindowOrigin());
    parsed.pathname = parsed.pathname.replace(API_PATH_PATTERN, '/') || '/';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return getWindowOrigin();
  }
}

function getWindowOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost';
}
