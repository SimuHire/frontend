import { Buffer } from 'buffer';

type Claims = Record<string, unknown>;

function decodeSegment(segment: string): Claims | null {
  try {
    const padded = segment.padEnd(
      segment.length + ((4 - (segment.length % 4)) % 4),
      '=',
    );
    const decoded =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded) as Claims;
    return parsed;
  } catch {
    return null;
  }
}

function decodeJwt(token?: string | null): Claims | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  return decodeSegment(parts[1]);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string') as string[];
}

function parsePermissionsString(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function rolesToPermissions(roles: string[]): string[] {
  const perms = new Set<string>();
  roles.forEach((role) => {
    const lower = role.toLowerCase();
    if (lower.includes('recruiter')) perms.add('recruiter:access');
    if (lower.includes('candidate')) perms.add('candidate:access');
  });
  return Array.from(perms);
}

function appendPermissions(set: Set<string>, items: string[]) {
  items.forEach((item) => set.add(item));
}

export function extractPermissions(
  user?: Claims | null,
  accessToken?: string | null,
): string[] {
  const collected = new Set<string>();

  const fromUser = [
    ...(toStringArray(user?.permissions) as string[]),
    ...toStringArray(user?.['https://simuhire.com/permissions']),
    ...parsePermissionsString(user?.['https://simuhire.com/permissions_str']),
  ];
  appendPermissions(collected, fromUser);

  const userRoles = toStringArray(
    user?.['https://simuhire.com/roles'] ?? (user?.roles as unknown),
  );
  appendPermissions(collected, rolesToPermissions(userRoles));

  if (collected.size > 0) return Array.from(collected);

  const claims = decodeJwt(accessToken);
  const tokenCustom = toStringArray(
    claims?.['https://simuhire.com/permissions'],
  );
  appendPermissions(collected, tokenCustom);
  appendPermissions(collected, toStringArray(claims?.permissions));
  appendPermissions(
    collected,
    parsePermissionsString(claims?.['https://simuhire.com/permissions_str']),
  );
  appendPermissions(
    collected,
    rolesToPermissions(
      toStringArray(claims?.['https://simuhire.com/roles'] ?? claims?.roles),
    ),
  );

  return Array.from(collected);
}

export function hasPermission(perms: string[], required: string) {
  return perms.includes(required);
}

export function getUserEmail(user?: Claims | null): string | null {
  const customEmail = user?.['https://simuhire.com/email'];
  if (typeof customEmail === 'string' && customEmail.trim()) {
    return customEmail.trim();
  }

  const email = user?.email;
  if (typeof email === 'string' && email.trim()) {
    return email.trim();
  }

  return null;
}
