import { NextResponse } from 'next/server';
import { getAccessToken, getSessionNormalized } from '@/lib/auth0';
import { extractPermissions, hasPermission } from '@/lib/auth0-claims';
import { BRAND_SLUG } from '@/lib/brand';

export const UPSTREAM_HEADER = `x-${BRAND_SLUG}-upstream-status`;
const DEBUG_PERF = process.env.TENON_DEBUG_PERF;

function stripTrailingApi(raw: string) {
  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
}

export function getBackendBaseUrl(): string {
  const raw = process.env.TENON_BACKEND_BASE_URL ?? 'http://localhost:8000';
  return stripTrailingApi(raw);
}

export async function parseUpstreamBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return (await res.json()) as unknown;
    } catch {
      return undefined;
    }
  }

  try {
    return await res.text();
  } catch {
    return undefined;
  }
}

export async function ensureAccessToken(
  requiredPermission?: string,
): Promise<NextResponse | { accessToken: string }> {
  const session = await getSessionNormalized();
  if (!session) {
    if (process.env.TENON_DEBUG_AUTH) {
      // eslint-disable-next-line no-console
      console.debug('[auth] no session available');
    }
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  if (requiredPermission) {
    const permissions = extractPermissions(
      session.user,
      (session as { accessToken?: string | null }).accessToken ?? null,
    );
    if (!hasPermission(permissions, requiredPermission)) {
      if (process.env.TENON_DEBUG_AUTH) {
        // eslint-disable-next-line no-console
        console.debug('[auth] missing permission', requiredPermission, {
          perms: permissions,
        });
      }
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    const accessToken = await getAccessToken();
    return { accessToken };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown token error';
    return NextResponse.json(
      { message: 'Not authenticated', details: msg },
      { status: 401 },
    );
  }
}

type ForwardOptions = {
  path: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  accessToken: string;
  cache?: RequestCache;
};

export async function forwardJson(options: ForwardOptions) {
  const { path, method = 'GET', headers = {}, body, accessToken } = options;
  const backendBase = getBackendBaseUrl();
  const start = DEBUG_PERF ? Date.now() : null;

  try {
    const upstream = await fetch(`${backendBase}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : typeof body === 'string'
            ? body
            : JSON.stringify(body),
      cache: options.cache ?? 'no-store',
      redirect: 'manual',
    });

    if (DEBUG_PERF && start !== null) {
      const elapsed = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(
        `[perf:bff] ${method} ${path} -> ${upstream.status} ${elapsed}ms`,
      );
    }

    const parsed = await parseUpstreamBody(upstream);
    const response = NextResponse.json(parsed, {
      status: upstream.status,
      headers: { [UPSTREAM_HEADER]: String(upstream.status) },
    });
    response.headers.delete('location');
    return response;
  } catch (e) {
    if (DEBUG_PERF && start !== null) {
      // eslint-disable-next-line no-console
      console.log(
        `[perf:bff] ${method} ${path} -> error ${Date.now() - start}ms`,
      );
    }
    throw e;
  }
}

export async function withAuthGuard(
  handler: (accessToken: string) => Promise<NextResponse>,
  options?: { requirePermission?: string },
) {
  const auth = await ensureAccessToken(options?.requirePermission);
  if (auth instanceof NextResponse) return auth;
  return handler(auth.accessToken);
}
