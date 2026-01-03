import { Buffer } from 'buffer';
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse, type NextRequest } from 'next/server';
import { normalizeUserClaims } from '@/lib/auth0-claims';
import {
  CUSTOM_CLAIM_PERMISSIONS,
  CUSTOM_CLAIM_PERMISSIONS_STR,
  CUSTOM_CLAIM_ROLES,
} from '@/lib/brand';

type Auth0EnvConfig = {
  secret?: string;
  domain?: string;
  clientId?: string;
  clientSecret?: string;
  appBaseUrl?: string;
  audience?: string;
  scope?: string;
};

function trimOrUndefined(value?: string | null) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function issuerToDomain(issuer?: string) {
  if (!issuer) return undefined;
  try {
    const url = new URL(issuer);
    return url.host || undefined;
  } catch {
    return issuer.replace(/^https?:\/\//, '').replace(/\/+$/, '') || undefined;
  }
}

function loadAuth0Env(): Auth0EnvConfig {
  const issuerRaw =
    trimOrUndefined(process.env.TENON_AUTH0_ISSUER_BASE_URL) ??
    trimOrUndefined(process.env.AUTH0_ISSUER_BASE_URL);
  const appBaseUrl =
    trimOrUndefined(process.env.TENON_APP_BASE_URL) ??
    trimOrUndefined(process.env.AUTH0_BASE_URL) ??
    trimOrUndefined(process.env.APP_BASE_URL);

  const domainFromIssuer = issuerToDomain(issuerRaw);

  return {
    secret:
      trimOrUndefined(process.env.TENON_AUTH0_SECRET) ??
      trimOrUndefined(process.env.AUTH0_SECRET),
    domain:
      trimOrUndefined(process.env.TENON_AUTH0_DOMAIN) ??
      domainFromIssuer ??
      trimOrUndefined(process.env.AUTH0_DOMAIN),
    clientId:
      trimOrUndefined(process.env.TENON_AUTH0_CLIENT_ID) ??
      trimOrUndefined(process.env.AUTH0_CLIENT_ID),
    clientSecret:
      trimOrUndefined(process.env.TENON_AUTH0_CLIENT_SECRET) ??
      trimOrUndefined(process.env.AUTH0_CLIENT_SECRET),
    appBaseUrl,
    audience:
      trimOrUndefined(process.env.TENON_AUTH0_AUDIENCE) ??
      trimOrUndefined(process.env.AUTH0_AUDIENCE),
    scope:
      trimOrUndefined(process.env.TENON_AUTH0_SCOPE) ??
      trimOrUndefined(process.env.AUTH0_SCOPE),
  };
}

const auth0Env = loadAuth0Env();

function hasAuth0Env(config: Auth0EnvConfig) {
  return Boolean(
    config.secret &&
    config.domain &&
    config.clientId &&
    config.clientSecret &&
    config.appBaseUrl,
  );
}

function createClient(config: Auth0EnvConfig) {
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
    appBaseUrl: config.appBaseUrl,
    domain: config.domain,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    secret: config.secret,
    authorizationParameters: {
      audience: config.audience,
      scope: config.scope || 'openid profile email',
    },
    signInReturnToPath: '/dashboard',
    beforeSessionSaved: async (session, idToken) => {
      const user = normalizeUserClaims(
        (session.user ?? {}) as Record<string, unknown>,
      );
      const userPerms = [
        ...toStringArray(user[CUSTOM_CLAIM_PERMISSIONS]),
        ...toStringArray(user.permissions),
        ...parsePermissionsString(user[CUSTOM_CLAIM_PERMISSIONS_STR]),
      ];
      const userRoles = toStringArray(
        user[CUSTOM_CLAIM_ROLES] ?? (user.roles as unknown),
      );

      const accessToken = normalizeAccessToken(
        (session as { accessToken?: unknown }).accessToken,
      );
      const tokenClaims = decodeJwt(accessToken) ?? decodeJwt(idToken) ?? {};
      const tokenPerms = [
        ...toStringArray(tokenClaims[CUSTOM_CLAIM_PERMISSIONS]),
        ...toStringArray(tokenClaims.permissions as unknown),
        ...parsePermissionsString(tokenClaims[CUSTOM_CLAIM_PERMISSIONS_STR]),
      ];
      const tokenRoles = toStringArray(
        tokenClaims[CUSTOM_CLAIM_ROLES] ?? (tokenClaims.roles as unknown),
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

      const merged: Record<string, unknown> = {
        ...user,
        permissions:
          normalizedPerms.length > 0 ? normalizedPerms : user.permissions,
        roles: normalizedRoles.length > 0 ? normalizedRoles : user.roles,
      };
      if (normalizedPerms.length > 0) {
        merged[CUSTOM_CLAIM_PERMISSIONS] = normalizedPerms;
      }
      if (normalizedRoles.length > 0) {
        merged[CUSTOM_CLAIM_ROLES] = normalizedRoles;
      }
      session.user = merged as typeof session.user;
      return session;
    },
  });
}

export const auth0 = hasAuth0Env(auth0Env)
  ? createClient(auth0Env)
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
  const token =
    typeof tokenResult === 'string'
      ? tokenResult
      : ((tokenResult as { token?: unknown })?.token ??
        (tokenResult as { accessToken?: unknown })?.accessToken);

  if (typeof token !== 'string' || !token) {
    throw new Error('No access token found in Auth0 session');
  }

  return token;
};

export const getSessionNormalized = async (
  request?: NextRequest,
): Promise<
  | (Awaited<ReturnType<typeof auth0.getSession>> & {
      user?: Record<string, unknown>;
    })
  | null
> => {
  const session = request
    ? await auth0.getSession(request)
    : await auth0.getSession();
  if (!session?.user) return session;
  return {
    ...session,
    user: normalizeUserClaims(
      session.user as Record<string, unknown>,
    ) as typeof session.user,
  };
};
