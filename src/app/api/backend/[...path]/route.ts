import { NextRequest, NextResponse } from 'next/server';
import {
  UPSTREAM_HEADER,
  getBackendBaseUrl,
  parseUpstreamBody,
} from '@/lib/server/bff';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type BackendRouteContext = { params: Promise<{ path: string[] }> };

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'host',
  'content-length',
  'accept-encoding',
  'upgrade',
  'keep-alive',
  'transfer-encoding',
  'cookie',
]);

async function proxyToBackend(req: NextRequest, context: BackendRouteContext) {
  const start = process.env.TENON_DEBUG_PERF ? Date.now() : null;
  const params = await context.params;
  const rawPath = params?.path;
  const pathSegments = Array.isArray(rawPath)
    ? rawPath
    : typeof rawPath === 'string'
      ? [rawPath]
      : [];
  const encodedPath =
    pathSegments.length > 0
      ? pathSegments.map(encodeURIComponent).join('/')
      : '';

  const search = req.nextUrl.search ?? '';
  const backendPath = `/api/${encodedPath}${search}`;
  const targetUrl = `${getBackendBaseUrl()}${backendPath}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
    redirect: 'manual',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      init.body = await req.arrayBuffer();
    } catch {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 },
      );
    }
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const upstreamStatus = upstream.status;
    const blockedRedirect = upstreamStatus >= 300 && upstreamStatus < 400;

    const upstreamHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!HOP_BY_HOP_HEADERS.has(lower) && lower !== 'location') {
        upstreamHeaders.set(key, value);
      }
    });
    upstreamHeaders.set(UPSTREAM_HEADER, String(upstreamStatus));

    let response: NextResponse;

    if (blockedRedirect) {
      response = NextResponse.json(
        { message: 'Upstream redirect blocked', upstreamStatus },
        { status: 502, headers: { [UPSTREAM_HEADER]: String(upstreamStatus) } },
      );
    } else {
      const contentType = upstream.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const parsed = await parseUpstreamBody(upstream);
        response = NextResponse.json(parsed ?? null, {
          status: upstreamStatus,
          headers: { [UPSTREAM_HEADER]: String(upstreamStatus) },
        });
      } else {
        let body: ArrayBuffer | string | null = null;
        try {
          body = await upstream.arrayBuffer();
        } catch {
          try {
            body = await upstream.text();
          } catch {
            body = null;
          }
        }

        response = new NextResponse(body ?? undefined, {
          status: upstreamStatus,
          headers: upstreamHeaders,
        });
      }
    }

    response.headers.delete('location');

    if (start !== null) {
      // eslint-disable-next-line no-console
      console.log(
        `[perf:backend-proxy] ${req.method} ${backendPath} -> ${upstreamStatus} ${Date.now() - start}ms`,
      );
    }

    return response;
  } catch (e: unknown) {
    return NextResponse.json(
      {
        message: 'Upstream request failed',
        detail: e instanceof Error ? e.message : undefined,
      },
      { status: 502 },
    );
  }
}

export function GET(req: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(req, context);
}

export function HEAD(req: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(req, context);
}

export function POST(req: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(req, context);
}

export function PUT(req: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(req, context);
}

export function PATCH(req: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(req, context);
}

export function DELETE(req: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(req, context);
}

export function OPTIONS(req: NextRequest, context: BackendRouteContext) {
  return proxyToBackend(req, context);
}
