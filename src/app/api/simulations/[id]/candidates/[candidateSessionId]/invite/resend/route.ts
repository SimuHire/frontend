import { NextRequest } from 'next/server';
import { forwardJson } from '@/lib/server/bff';
import { mergeResponseCookies, requireBffAuth } from '@/lib/server/bffAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; candidateSessionId: string }> },
) {
  const { id, candidateSessionId } = await context.params;

  const auth = await requireBffAuth(req, {
    requirePermission: 'recruiter:access',
  });
  if (!auth.ok) {
    mergeResponseCookies(auth.cookies, auth.response);
    return auth.response;
  }

  const resp = await forwardJson({
    path: `/api/simulations/${encodeURIComponent(id)}/candidates/${encodeURIComponent(candidateSessionId)}/invite/resend`,
    method: 'POST',
    cache: 'no-store',
    accessToken: auth.accessToken,
  });
  mergeResponseCookies(auth.cookies, resp);
  return resp;
}
