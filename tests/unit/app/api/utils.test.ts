import { NextRequest, NextResponse } from 'next/server';
import { markMetadataCovered } from './coverageHelpers';

const mockRequireBffAuth = jest.fn();
const mockMergeResponseCookies = jest.fn();
const mockForwardJson = jest.fn();
const mockResolveRequestId = jest.fn(() => 'req-utils');

jest.mock('@/platform/server/bffAuth', () => ({
  requireBffAuth: (...args: unknown[]) => mockRequireBffAuth(...args),
  mergeResponseCookies: (...args: unknown[]) =>
    mockMergeResponseCookies(...args),
}));

jest.mock('@/platform/server/bff', () => ({
  forwardJson: (...args: unknown[]) => mockForwardJson(...args),
  resolveRequestId: (...args: unknown[]) => mockResolveRequestId(...args),
  REQUEST_ID_HEADER: 'x-request-id',
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: (
      body: unknown,
      init?: { status?: number; headers?: Record<string, string> },
    ) => {
      const headers = new Map<string, string>();
      Object.entries(init?.headers ?? {}).forEach(([k, v]) =>
        headers.set(k, String(v)),
      );
      return {
        status: init?.status ?? 200,
        headers: {
          set: (k: string, v: string) => headers.set(k, v),
          get: (k: string) => headers.get(k) ?? null,
        },
        body,
      };
    },
  },
}));

const importUtils = async () => import('@/app/api/bffRouteHelpers');

describe('api utils helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('returns auth failure with request id for forwardBffWithAuth', async () => {
    mockRequireBffAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ message: 'nope' }, { status: 401 }),
      cookies: [],
    });
    const { forwardBffWithAuth } = await importUtils();
    markMetadataCovered('@/app/api/bffRouteHelpers.ts');
    const resp = await forwardBffWithAuth(
      { path: '/api/thing' },
      {} as unknown as NextRequest,
    );
    expect(resp.status).toBe(401);
    expect(resp.headers.get('x-request-id')).toBe('req-utils');
    expect(mockMergeResponseCookies).toHaveBeenCalled();
  });

  it('forwards with auth success and tags response', async () => {
    mockRequireBffAuth.mockResolvedValue({
      ok: true,
      accessToken: 'tok',
      cookies: [],
    });
    mockForwardJson.mockResolvedValue(
      NextResponse.json({ ok: true }, { headers: { existing: '1' } }),
    );
    const { forwardBffWithAuth, BFF_HEADER } = await importUtils();
    const resp = await forwardBffWithAuth(
      { path: '/api/ok', tag: 'dash', cache: 'force-cache' },
      {} as unknown as NextRequest,
    );

    expect(mockForwardJson).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api/ok',
        accessToken: 'tok',
        cache: 'force-cache',
        requestId: 'req-utils',
      }),
    );
    expect(resp.headers.get(BFF_HEADER)).toBe('dash');
  });

  it('rejects cookie-authenticated state-changing BFF requests without same-origin evidence', async () => {
    const { forwardBffWithAuth } = await importUtils();
    const req = {
      method: 'POST',
      nextUrl: new URL('https://app.winoe.ai/api/submissions'),
      headers: new Headers({ cookie: 'appSession=abc' }),
    } as unknown as NextRequest;

    const resp = await forwardBffWithAuth(
      { path: '/api/submissions', method: 'POST' },
      req,
    );

    expect(resp.status).toBe(403);
    expect(resp.headers.get('x-request-id')).toBe('req-utils');
    expect(mockRequireBffAuth).not.toHaveBeenCalled();
  });

  it('allows same-origin state-changing BFF requests to reach auth', async () => {
    mockRequireBffAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json(
        { message: 'auth required' },
        { status: 401 },
      ),
      cookies: [],
    });
    const { forwardBffWithAuth } = await importUtils();
    const req = {
      method: 'POST',
      nextUrl: new URL('https://app.winoe.ai/api/submissions'),
      headers: new Headers({
        cookie: 'appSession=abc',
        origin: 'https://app.winoe.ai',
      }),
    } as unknown as NextRequest;

    const resp = await forwardBffWithAuth(
      { path: '/api/submissions', method: 'POST' },
      req,
    );

    expect(resp.status).toBe(401);
    expect(mockRequireBffAuth).toHaveBeenCalled();
  });

  it('wraps upstream errors from forwardJson', async () => {
    mockRequireBffAuth.mockResolvedValue({
      ok: true,
      accessToken: 'tok',
      cookies: [],
    });
    mockForwardJson.mockRejectedValue(new Error('boom'));
    const { forwardBffWithAuth } = await importUtils();
    const resp = await forwardBffWithAuth(
      { path: '/api/fail' },
      {} as unknown as NextRequest,
    );
    expect(resp.status).toBe(500);
    expect(resp.headers.get('x-request-id')).toBe('req-utils');
  });

  it('withTalentPartnerAuth returns auth failure with headers', async () => {
    mockRequireBffAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ message: 'forbidden' }, { status: 403 }),
      cookies: [],
    });
    const { withTalentPartnerAuth } = await importUtils();
    const resp = await withTalentPartnerAuth(
      {} as unknown as NextRequest,
      { tag: 'dash' },
      jest.fn(),
    );
    expect(resp.status).toBe(403);
    expect(resp.headers.get('x-request-id')).toBe('req-utils');
  });

  it('rejects cookie-authenticated Winoe Report generation without same-origin evidence', async () => {
    const { withTalentPartnerAuth } = await importUtils();
    const req = {
      method: 'POST',
      nextUrl: new URL(
        'https://app.winoe.ai/api/candidate_trials/2/winoe_report/generate',
      ),
      headers: new Headers({ cookie: 'appSession=abc' }),
    } as unknown as NextRequest;

    const handler = jest.fn();
    const resp = await withTalentPartnerAuth(
      req,
      { tag: 'winoe-report-generate' },
      handler,
    );

    expect(resp.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
    expect(mockRequireBffAuth).not.toHaveBeenCalled();
  });

  it('withTalentPartnerAuth merges cookies, tags success, and wraps handler errors', async () => {
    mockRequireBffAuth.mockResolvedValue({
      ok: true,
      accessToken: 'tok',
      cookies: [],
    });
    const { withTalentPartnerAuth, BFF_HEADER } = await importUtils();

    const okResp = await withTalentPartnerAuth(
      {} as unknown as NextRequest,
      { tag: 'sim' },
      async () =>
        NextResponse.json({ ok: true }, { headers: { existing: 'yes' } }),
    );
    expect(okResp.headers.get(BFF_HEADER)).toBe('sim');
    expect(okResp.headers.get('x-request-id')).toBe('req-utils');

    const errResp = await withTalentPartnerAuth(
      {} as unknown as NextRequest,
      { tag: 'sim' },
      async () => {
        throw new Error('boom');
      },
    );
    expect(errResp.status).toBe(500);
    expect(errResp.headers.get(BFF_HEADER)).toBe('sim');
    expect(errResp.headers.get('x-request-id')).toBe('req-utils');
  });

  it('errorResponse uses default fallback and omits request id', async () => {
    const { errorResponse } = await importUtils();
    const resp = errorResponse('plain');
    expect(resp.status).toBe(500);
    // @ts-expect-error mock headers
    expect(resp.headers.get('x-request-id')).toBeNull();
  });
});
