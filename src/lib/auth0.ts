import { Buffer } from 'buffer';
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

function hasAuth0Env() {
  return Boolean(
    process.env.AUTH0_SECRET &&
    process.env.AUTH0_DOMAIN &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET &&
    process.env.APP_BASE_URL,
  );
}

function createClient() {
  const toStringArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? (value.filter((v) => typeof v === 'string') as string[])
      : [];

  const parsePermissionsString = (value: unknown): string[] => {
    if (typeof value !== 'string') return [];
    return value
      .split(/[,\s]+/)
      .map((part) => part.trim())
      .filter(Boolean);
  };

  const rolesToPermissions = (roles: string[]): string[] => {
    const perms = new Set<string>();
    roles.forEach((role) => {
      const lower = role.toLowerCase();
      if (lower.includes('recruiter')) perms.add('recruiter:access');
      if (lower.includes('candidate')) perms.add('candidate:access');
    });
    return Array.from(perms);
  };

  const normalizeAccessToken = (raw: unknown): string | null => {
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') {
      const token =
        (raw as { accessToken?: unknown }).accessToken ??
        (raw as { token?: unknown }).token;
      return typeof token === 'string' ? token : null;
    }
    return null;
  };

  const decodeJwt = (token: string | null): Record<string, unknown> | null => {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const padded = parts[1].padEnd(
        parts[1].length + ((4 - (parts[1].length % 4)) % 4),
        '=',
      );
      const decoded =
        typeof atob === 'function'
          ? atob(padded)
          : Buffer.from(padded, 'base64').toString('utf8');
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  return new Auth0Client({
    authorizationParameters: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: process.env.AUTH0_SCOPE,
    },
    signInReturnToPath: '/dashboard',
    beforeSessionSaved: async (session, idToken) => {
      const user = (session.user ?? {}) as Record<string, unknown>;
      const userPerms = [
        ...toStringArray(user['https://simuhire.com/permissions']),
        ...toStringArray(user.permissions),
        ...parsePermissionsString(user['https://simuhire.com/permissions_str']),
      ];
      const userRoles = toStringArray(
        user['https://simuhire.com/roles'] ?? (user.roles as unknown),
      );

      const accessToken = normalizeAccessToken(
        (session as { accessToken?: unknown }).accessToken,
      );
      const tokenClaims = decodeJwt(accessToken) ?? decodeJwt(idToken) ?? {};
      const tokenPerms = [
        ...toStringArray(tokenClaims['https://simuhire.com/permissions']),
        ...toStringArray(tokenClaims.permissions as unknown),
        ...parsePermissionsString(
          tokenClaims['https://simuhire.com/permissions_str'],
        ),
      ];
      const tokenRoles = toStringArray(
        tokenClaims['https://simuhire.com/roles'] ??
          (tokenClaims.roles as unknown),
      );

      const normalizedPerms =
        userPerms.length > 0
          ? userPerms
          : [
              ...tokenPerms,
              ...rolesToPermissions(userRoles),
              ...rolesToPermissions(tokenRoles),
            ];
      const normalizedRoles = userRoles.length > 0 ? userRoles : tokenRoles;

      if (normalizedPerms.length > 0) {
        session.user = {
          ...session.user,
          'https://simuhire.com/permissions': normalizedPerms,
        };
      }

      if (normalizedRoles.length > 0) {
        session.user = {
          ...session.user,
          'https://simuhire.com/roles': normalizedRoles,
        };
      }

      return session;
    },
  });
}

export const auth0 = hasAuth0Env()
  ? createClient()
  : {
      middleware: async () => NextResponse.next(),
      getSession: async () => null,
      getAccessToken: async () => {
        throw new Error(
          'Auth0 env vars are missing. Access token is unavailable in this environment.',
        );
      },
    };

export const getAccessToken = async () => {
  const tokenResult = await auth0.getAccessToken();

  if (!tokenResult?.token) {
    throw new Error('No access token found in Auth0 session');
  }

  return tokenResult.token;
};
