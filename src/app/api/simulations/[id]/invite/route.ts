import { NextRequest } from 'next/server';
import { forwardJson } from '@/lib/server/bff';
import { BFF_HEADER } from '@/app/api/utils';
import { mergeResponseCookies, requireBffAuth } from '@/lib/server/bffAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const payload: unknown = await req.json().catch(() => undefined);

  const auth = await requireBffAuth(req, {
    requirePermission: 'recruiter:access',
  });
  if (!auth.ok) {
    mergeResponseCookies(auth.cookies, auth.response);
    return auth.response;
  }

  const resp = await forwardJson({
    path: `/api/simulations/${encodeURIComponent(id)}/invite`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload ?? {},
    accessToken: auth.accessToken,
  });
  mergeResponseCookies(auth.cookies, resp);
  resp.headers.set(BFF_HEADER, 'invite');
  return resp;
}
