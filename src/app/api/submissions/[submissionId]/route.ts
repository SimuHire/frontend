import { NextRequest, NextResponse } from 'next/server';
import { ensureAccessToken, forwardJson } from '@/lib/server/bff';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ submissionId: string }> },
) {
  const { submissionId } = await context.params;

  const auth = await ensureAccessToken();
  if (auth instanceof NextResponse) return auth;

  const resp = await forwardJson({
    path: `/api/submissions/${encodeURIComponent(submissionId)}`,
    accessToken: auth.accessToken,
  });
  resp.headers.set('x-simuhire-bff', 'submission-detail');
  return resp;
}
