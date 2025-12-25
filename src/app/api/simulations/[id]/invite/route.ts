import { NextRequest, NextResponse } from 'next/server';
import { ensureAccessToken, forwardJson } from '@/lib/server/bff';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const auth = await ensureAccessToken();
  if (auth instanceof NextResponse) return auth;

  const payload: unknown = await req.json().catch(() => undefined);

  const resp = await forwardJson({
    path: `/api/simulations/${encodeURIComponent(id)}/invite`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload ?? {},
    accessToken: auth.accessToken,
  });
  resp.headers.set('x-simuhire-bff', 'invite');
  return resp;
}
