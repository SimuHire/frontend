jest.mock('next/server', () => {
  const buildHeaders = (
    init?:
      | Record<string, string>
      | { forEach?: (cb: (value: string, key: string) => void) => void },
  ) => {
    const store = new Map<string, string>();
    if (init && typeof (init as { forEach?: unknown }).forEach === 'function') {
      (
        init as { forEach: (cb: (value: string, key: string) => void) => void }
      ).forEach((value, key) => store.set(key.toLowerCase(), value));
    } else {
      Object.entries((init as Record<string, string>) ?? {}).forEach(([k, v]) =>
        store.set(k.toLowerCase(), v),
      );
    }
    return {
      get: (key: string) => store.get(key.toLowerCase()) ?? null,
      set: (key: string, value: string) => store.set(key.toLowerCase(), value),
      delete: (key: string) => store.delete(key.toLowerCase()),
      forEach: (cb: (value: string, key: string) => void) => {
        store.forEach((value, key) => cb(value, key));
      },
    };
  };

  class FakeNextResponse {
    status: number;
    body: unknown;
    headers: ReturnType<typeof buildHeaders>;
    cookies: {
      set: (
        name: string | { name: string; value: string },
        value?: string,
      ) => void;
      getAll: () => { name: string; value: string }[];
    };

    constructor(body?: unknown, init?: { status?: number; headers?: unknown }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = buildHeaders(init?.headers as Record<string, string>);
      const cookieStore = new Map<string, { name: string; value: string }>();
      this.cookies = {
        set: (
          name: string | { name: string; value: string },
          value?: string,
        ) => {
          if (typeof name === 'object' && name !== null) {
            cookieStore.set(name.name, { name: name.name, value: name.value });
            return;
          }
          cookieStore.set(name, { name, value: value ?? '' });
        },
        getAll: () => Array.from(cookieStore.values()),
      };
    }

    static json(body: unknown, init?: { status?: number; headers?: unknown }) {
      return new FakeNextResponse(body, {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers as Record<string, string>),
        },
      });
    }
  }

  class FakeNextRequest {
    url: string;
    nextUrl: URL;
    headers: {
      forEach: (cb: (value: string, key: string) => void) => void;
    };
    method: string;
    constructor(
      url: URL | string,
      init?: { method?: string; headers?: Record<string, string> },
    ) {
      this.url = url.toString();
      this.nextUrl = new URL(this.url);
      this.method = init?.method ?? 'GET';
      const headerStore = new Map<string, string>();
      Object.entries(init?.headers ?? {}).forEach(([k, v]) =>
        headerStore.set(k.toLowerCase(), v),
      );
      this.headers = {
        forEach: (cb: (value: string, key: string) => void) =>
          headerStore.forEach((v, k) => cb(v, k)),
      };
    }
  }

  return {
    NextResponse: FakeNextResponse,
    NextRequest: FakeNextRequest,
  };
});

import { TextDecoder, TextEncoder } from 'util';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/backend/[...path]/route';
type FakeResponseShape = {
  body: unknown;
  status: number;
  headers: { get: (key: string) => string | null };
};

jest.mock('@/lib/server/bff', () => ({
  getBackendBaseUrl: jest.fn(() => 'https://backend.test'),
  parseUpstreamBody: jest.fn(async (res: Response) => {
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch {
        return undefined;
      }
    }
    try {
      return await res.text();
    } catch {
      return undefined;
    }
  }),
  UPSTREAM_HEADER: 'x-tenon-upstream-status',
}));

const fetchMock = jest.fn();
const originalFetch = global.fetch;
const encoder = new TextEncoder();

function mockResponse(
  body: string | ArrayBuffer,
  init: { status: number; headers?: Record<string, string> },
) {
  const headerStore = new Map<string, string>();
  Object.entries(init.headers ?? {}).forEach(([k, v]) =>
    headerStore.set(k.toLowerCase(), v),
  );
  return {
    status: init.status,
    headers: {
      get: (key: string) => headerStore.get(key.toLowerCase()) ?? null,
      forEach: (cb: (value: string, key: string) => void) =>
        headerStore.forEach((v, k) => cb(v, k)),
    },
    async json() {
      const text =
        typeof body === 'string'
          ? body
          : new TextDecoder().decode(body as ArrayBuffer);
      return JSON.parse(text);
    },
    async text() {
      return typeof body === 'string'
        ? body
        : new TextDecoder().decode(body as ArrayBuffer);
    },
    async arrayBuffer() {
      return typeof body === 'string'
        ? encoder.encode(body).buffer
        : (body as ArrayBuffer);
    },
  };
}

describe('/api/backend proxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-expect-error - assign mock fetch
    global.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    // @ts-expect-error - restore real fetch
    global.fetch = originalFetch;
  });

  it('passes through JSON responses and sets upstream header', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const res = await GET(
      new NextRequest('http://localhost/api/backend/foo?x=1') as never,
      { params: Promise.resolve({ path: ['foo'] }) },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.test/api/foo?x=1',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(res.status).toBe(200);
    expect((res as FakeResponseShape).body).toEqual({ ok: true });
    expect(res.headers.get('x-tenon-upstream-status')).toBe('200');
    expect(res.headers.get('location')).toBeNull();
  });

  it('passes through non-JSON content and preserves content-type', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse('plain body', {
        status: 201,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const res = await GET(
      new NextRequest('http://localhost/api/backend/bar') as never,
      { params: Promise.resolve({ path: ['bar'] }) },
    );

    expect(res.status).toBe(201);
    const decoded = new TextDecoder().decode(
      (res as FakeResponseShape).body as ArrayBuffer,
    );
    expect(decoded).toBe('plain body');
    expect(res.headers.get('content-type')).toBe('text/plain');
    expect(res.headers.get('x-tenon-upstream-status')).toBe('201');
  });

  it('blocks upstream redirects and strips location header', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse('', {
        status: 302,
        headers: { location: 'https://example.com' },
      }),
    );

    const res = await GET(
      new NextRequest('http://localhost/api/backend/baz') as never,
      { params: Promise.resolve({ path: ['baz'] }) },
    );

    expect(res.status).toBe(502);
    expect((res as FakeResponseShape).body).toEqual({
      message: 'Upstream redirect blocked',
      upstreamStatus: 302,
    });
    expect(res.headers.get('x-tenon-upstream-status')).toBe('302');
    expect(res.headers.get('location')).toBeNull();
  });
});
