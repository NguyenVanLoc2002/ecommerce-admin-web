import { queryClient } from './queryClient';
import { useAuthStore } from '../stores/authStore';

const LEGACY_EXACT_KEYS = new Set([
  'auth-storage',
  'fashion-shop.refresh-token-hint',
]);

function shouldRemoveLegacyAuthKey(key: string, value: string | null): boolean {
  const normalizedKey = key.toLowerCase();

  if (LEGACY_EXACT_KEYS.has(key)) {
    return true;
  }

  if (normalizedKey.includes('refresh-token') || normalizedKey.includes('refreshtoken')) {
    return true;
  }

  if (normalizedKey.includes('admin') && normalizedKey.includes('refresh')) {
    return true;
  }

  if ((normalizedKey.includes('auth') || normalizedKey.includes('token')) && value?.includes('"refreshToken"')) {
    return true;
  }

  return false;
}

function sweepStorage(storage: Storage) {
  const keysToRemove: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) {
      continue;
    }

    if (shouldRemoveLegacyAuthKey(key, storage.getItem(key))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
}

export function purgeLegacyAuthStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  sweepStorage(window.localStorage);
  sweepStorage(window.sessionStorage);
}

export function clearClientAuthState() {
  purgeLegacyAuthStorage();
  void queryClient.cancelQueries();
  useAuthStore.getState().clear();
  queryClient.clear();
}
