import { NextRequest, NextResponse } from 'next/server';
import { forwardJson } from '@/lib/server/bff';
import { BRAND_SLUG } from '@/lib/brand';
import { mergeResponseCookies, requireBffAuth } from '@/lib/server/bffAuth';

export const BFF_HEADER = `x-${BRAND_SLUG}-bff`;

type ForwardArgs = {
  path: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  cache?: RequestCache;
  tag?: string;
  requirePermission?: string;
};

export async function forwardWithAuth(
  { tag, requirePermission, ...args }: ForwardArgs,
  req: NextRequest,
): Promise<NextResponse> {
  const auth = await requireBffAuth(req, {
    requirePermission: requirePermission,
  });
  if (!auth.ok) {
    const resp = auth.response;
    mergeResponseCookies(auth.cookies, resp);
    return resp;
  }

  let resp: NextResponse;
  try {
    resp = await forwardJson({
      ...args,
      accessToken: auth.accessToken,
      cache: args.cache ?? 'no-store',
    });
  } catch (e: unknown) {
    const error = errorResponse(e);
    mergeResponseCookies(auth.cookies, error);
    return error;
  }

  mergeResponseCookies(auth.cookies, resp);

  if (tag) {
    resp.headers.set(BFF_HEADER, tag);
  }

  return resp;
}

export function errorResponse(e: unknown, fallback = 'Upstream error') {
  const message = e instanceof Error ? `${fallback}: ${e.message}` : fallback;
  return NextResponse.json({ message }, { status: 500 });
}

type RecruiterAuthHandler = (auth: {
  accessToken: string;
  cookies: NextResponse;
}) => Promise<NextResponse>;

export async function withRecruiterAuth(
  req: NextRequest,
  options: { tag: string; requirePermission?: string },
  handler: RecruiterAuthHandler,
): Promise<NextResponse> {
  const auth = await requireBffAuth(req, {
    requirePermission: options.requirePermission ?? 'recruiter:access',
  });

  if (!auth.ok) {
    mergeResponseCookies(auth.cookies, auth.response);
    return auth.response;
  }

  try {
    const resp = await handler(auth);
    mergeResponseCookies(auth.cookies, resp);
    resp.headers.set(BFF_HEADER, options.tag);
    return resp;
  } catch (e: unknown) {
    const error = errorResponse(e);
    mergeResponseCookies(auth.cookies, error);
    error.headers.set(BFF_HEADER, options.tag);
    return error;
  }
}
