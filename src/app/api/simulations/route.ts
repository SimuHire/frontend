import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, BFF_HEADER } from '@/app/api/utils';
import { forwardJson } from '@/lib/server/bff';
import { mergeResponseCookies, requireBffAuth } from '@/lib/server/bffAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireBffAuth(req, {
      requirePermission: 'recruiter:access',
    });
    if (!auth.ok) {
      mergeResponseCookies(auth.cookies, auth.response);
      return auth.response;
    }

    const resp = await forwardJson({
      path: '/api/simulations',
      accessToken: auth.accessToken,
    });
    mergeResponseCookies(auth.cookies, resp);
    resp.headers.set(BFF_HEADER, 'simulations-list');
    return resp;
  } catch (e: unknown) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireBffAuth(req, {
      requirePermission: 'recruiter:access',
    });
    if (!auth.ok) {
      mergeResponseCookies(auth.cookies, auth.response);
      return auth.response;
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const bad = NextResponse.json(
        { message: 'Bad request' },
        { status: 400 },
      );
      mergeResponseCookies(auth.cookies, bad);
      return bad;
    }

    const resp = await forwardJson({
      path: '/api/simulations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      accessToken: auth.accessToken,
    });
    mergeResponseCookies(auth.cookies, resp);
    resp.headers.set(BFF_HEADER, 'simulations-create');
    return resp;
  } catch (e: unknown) {
    return errorResponse(e);
  }
}
