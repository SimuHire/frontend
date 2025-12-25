import { NextResponse } from 'next/server';
import { ensureAccessToken, forwardJson } from '@/lib/server/bff';

export async function GET() {
  const auth = await ensureAccessToken();
  if (auth instanceof NextResponse) return auth;

  try {
    return await forwardJson({
      path: '/api/simulations',
      accessToken: auth.accessToken,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? `Upstream error: ${e.message}` : 'Upstream error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await ensureAccessToken();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await req.json()) as unknown;

    return await forwardJson({
      path: '/api/simulations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      accessToken: auth.accessToken,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? `Upstream error: ${e.message}` : 'Upstream error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
