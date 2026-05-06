import { Role, type AuthUser } from '../types/auth.types';

type JwtPayload = Record<string, unknown>;

const ROLE_PRIORITY: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF];

function decodeBase64Url(input: string): string | null {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return atob(padded);
  } catch {
    return null;
  }
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payloadSegment] = token.split('.');
  if (!payloadSegment) {
    return null;
  }

  const decoded = decodeBase64Url(payloadSegment);
  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function pickId(...values: unknown[]): string | number | null | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => toStringArray(item));
  }

  if (typeof value === 'string') {
    return value
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeRoles(roles: string[]): Role[] {
  const deduped = new Set<Role>();

  roles.forEach((role) => {
    const normalized = role.toUpperCase();
    if (normalized === Role.STAFF || normalized === Role.ADMIN || normalized === Role.SUPER_ADMIN) {
      deduped.add(normalized);
    }
  });

  return Array.from(deduped);
}

export function extractRolesFromAccessToken(token: string): Role[] {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return [];
  }

  return normalizeRoles([
    ...toStringArray(payload['roles']),
    ...toStringArray(payload['role']),
    ...toStringArray(payload['authorities']),
    ...toStringArray(payload['authority']),
    ...toStringArray(payload['scope']),
    ...toStringArray(payload['scp']),
  ]);
}

export function selectPrimaryRole(roles: string[]): Role | null {
  const normalized = normalizeRoles(roles);
  return ROLE_PRIORITY.find((role) => normalized.includes(role)) ?? null;
}

export function deriveAuthUserFromAccessToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const roles = extractRolesFromAccessToken(token);
  const email = pickString(payload['email'], payload['sub']);
  const displayName = pickString(payload['name']);
  const firstName =
    pickString(payload['firstName'], payload['given_name']) ??
    displayName?.split(/\s+/)[0];
  const lastName =
    pickString(payload['lastName'], payload['family_name']) ??
    (displayName?.split(/\s+/).slice(1).join(' ') || undefined);
  const id = pickId(payload['userId'], payload['user_id'], payload['id'], payload['uid']);

  if (!email && roles.length === 0 && id == null) {
    return null;
  }

  return {
    id,
    email,
    firstName,
    lastName,
    status: pickString(payload['status']),
    createdAt: pickString(payload['createdAt'], payload['created_at']),
    roles,
  };
}
