import { NextResponse } from 'next/server';
import { ensureAccessToken, forwardJson } from '@/lib/server/bff';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const auth = await ensureAccessToken();
  if (auth instanceof NextResponse) return auth;

  const resp = await forwardJson({
    path: `/api/simulations/${encodeURIComponent(id)}/candidates`,
    accessToken: auth.accessToken,
  });
  resp.headers.set('x-simuhire-bff', 'simulations-candidates');
  return resp;
}
