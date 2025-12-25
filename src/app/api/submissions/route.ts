import { NextRequest, NextResponse } from 'next/server';
import { ensureAccessToken, forwardJson } from '@/lib/server/bff';

export async function GET(req: NextRequest) {
  const auth = await ensureAccessToken();
  if (auth instanceof NextResponse) return auth;

  const search = req.nextUrl.searchParams.toString();
  const path = `/api/submissions${search ? `?${search}` : ''}`;

  const resp = await forwardJson({
    path,
    accessToken: auth.accessToken,
  });
  resp.headers.set('x-simuhire-bff', 'submissions-list');
  return resp;
}
