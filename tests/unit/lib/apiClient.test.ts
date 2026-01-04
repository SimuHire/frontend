import {
  apiClient,
  login,
  safeRequest,
  __resetAuthRedirectForTests,
} from '@/lib/api/httpClient';
import { getAuthToken } from '@/lib/auth';
import { responseHelpers } from '../../setup';

jest.mock('@/lib/auth', () => ({
  getAuthToken: jest.fn(),
}));

const fetchMock = jest.fn();

describe('apiClient request helpers', () => {
  const originalLocation = window.location;

  function mockLocation(pathname: string, search = '') {
    const assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        pathname,
        search,
        assign,
      } as Location,
    });
    return { assign, restore: () => mockRestoreLocation() };
  }

  function mockRestoreLocation() {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  }

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    (getAuthToken as jest.Mock).mockReset();
    mockRestoreLocation();
    __resetAuthRedirectForTests();
  });

  it('attaches auth token by default and normalizes URLs', async () => {
    (getAuthToken as jest.Mock).mockReturnValue('token-123');
    fetchMock.mockResolvedValue(
      responseHelpers.jsonResponse({ ok: true, data: { message: 'hi' } }),
    );

    await apiClient.get('/jobs');

    expect(fetchMock).toHaveBeenCalledWith('/api/jobs', {
      method: 'GET',
      headers: { Authorization: 'Bearer token-123' },
      body: undefined,
      credentials: 'include',
    });
  });

  it('respects skipAuth and custom basePath', async () => {
    fetchMock.mockResolvedValue(
      responseHelpers.jsonResponse({ created: true, id: 7 }),
    );

    await apiClient.post(
      'tasks',
      { title: 'New' },
      { basePath: 'https://api.example.com', skipAuth: true },
    );

    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New' }),
      credentials: 'include',
    });
  });

  it('does not stringify FormData bodies', async () => {
    const fd = new FormData();
    fd.append('file', 'content');
    fetchMock.mockResolvedValue(responseHelpers.jsonResponse({ ok: true }));

    await apiClient.post('/upload', fd);

    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.body).toBe(fd);
    expect(opts.headers).not.toHaveProperty('Content-Type');
  });

  it('extracts error messages from API errors', async () => {
    fetchMock.mockResolvedValue(
      responseHelpers.jsonResponse(
        { detail: [{ msg: 'Invalid password' }] },
        422,
      ),
    );

    await expect(
      login({ email: 'a@b.com', password: 'x' }),
    ).rejects.toMatchObject({
      message: 'Invalid password',
      status: 422,
    });
  });

  it('falls back to status-based messages for text errors', async () => {
    fetchMock.mockResolvedValue(
      responseHelpers.textResponse('Internal error', 500, {
        'content-type': 'text/plain',
      }),
    );

    await expect(apiClient.get('/oops')).rejects.toMatchObject({
      message: 'Request failed with status 500',
      status: 500,
    });
  });

  it('returns undefined for 204 responses', async () => {
    fetchMock.mockResolvedValue(
      responseHelpers.textResponse('', 204, { 'content-type': '' }),
    );

    const resp = await apiClient.delete('/noop');

    expect(resp).toBeUndefined();
  });

  it('handles malformed JSON bodies gracefully', async () => {
    const badJsonResponse = {
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => {
        throw new Error('bad json');
      },
      text: async () => {
        throw new Error('should not call text');
      },
    } as unknown as Response;

    fetchMock.mockResolvedValue(badJsonResponse);

    const resp = await apiClient.get('/bad-json');
    expect(resp).toBeUndefined();
  });

  it('handles text body failures gracefully', async () => {
    const textFailResponse = {
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      json: async () => {
        throw new Error('not json');
      },
      text: async () => {
        throw new Error('text read failed');
      },
    } as unknown as Response;

    fetchMock.mockResolvedValue(textFailResponse);

    const resp = await apiClient.get('/text-fail');
    expect(resp).toBeUndefined();
  });

  it('supports delete with request options and explicit basePath', async () => {
    fetchMock.mockResolvedValue(responseHelpers.jsonResponse({}, 200));

    await apiClient.delete(
      '/custom-delete',
      { headers: { 'X-Del': '1' } },
      { basePath: 'https://api.dev' },
    );

    expect(fetchMock).toHaveBeenCalledWith('https://api.dev/custom-delete', {
      method: 'DELETE',
      headers: { 'X-Del': '1' },
      body: undefined,
      credentials: 'include',
    });
  });

  it('passes through provided authToken to request helper', async () => {
    fetchMock.mockResolvedValue(responseHelpers.jsonResponse({}, 200));

    await apiClient.post('/auth', { ok: true }, { authToken: 'tok' });

    expect(fetchMock).toHaveBeenCalledWith('/api/auth', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer tok',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: true }),
      credentials: 'include',
    });
  });

  it('uses explicit authToken and merges headers for put/patch/delete', async () => {
    fetchMock
      .mockResolvedValueOnce(responseHelpers.jsonResponse({ ok: true }))
      .mockResolvedValueOnce(responseHelpers.jsonResponse({ ok: true }))
      .mockResolvedValueOnce(responseHelpers.jsonResponse({ ok: true }));

    await apiClient.put(
      '/put-me',
      { a: 1 },
      { headers: { 'X-Test': 'one' } },
      { authToken: 'custom-token' },
    );

    await apiClient.patch('/patch-me', { b: 2 }, { authToken: 'custom-token' });
    await apiClient.delete('/delete-me', { headers: { 'X-Req': 'del' } });

    const putCall = fetchMock.mock.calls[0] as unknown[];
    const patchCall = fetchMock.mock.calls[1] as unknown[];
    const deleteCall = fetchMock.mock.calls[2] as unknown[];

    expect(putCall[0]).toBe('/api/put-me');
    expect(putCall[1]).toMatchObject({
      method: 'PUT',
      headers: {
        Authorization: 'Bearer custom-token',
        'Content-Type': 'application/json',
        'X-Test': 'one',
      },
    });

    expect(patchCall[1]).toMatchObject({
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer custom-token',
        'Content-Type': 'application/json',
      },
    });

    expect(deleteCall[1]).toMatchObject({
      method: 'DELETE',
      headers: {},
    });
  });

  it('respects provided authToken even when window is defined', async () => {
    (getAuthToken as jest.Mock).mockReturnValue('ignored');
    fetchMock.mockResolvedValue(responseHelpers.jsonResponse({ ok: true }));

    await apiClient.get('/auth-pref', { authToken: 'from-opts' });

    expect(fetchMock).toHaveBeenCalledWith('/api/auth-pref', {
      method: 'GET',
      headers: { Authorization: 'Bearer from-opts' },
      body: undefined,
      credentials: 'include',
    });
  });

  it('safeRequest returns data and wraps unknown errors', async () => {
    fetchMock
      .mockResolvedValueOnce(
        responseHelpers.jsonResponse({ ok: true, value: 1 }),
      )
      .mockRejectedValueOnce('bad');

    const success = await safeRequest<{ value: number }>('/path');
    expect(success).toMatchObject({ data: { value: 1 }, error: null });

    const failure = await safeRequest('/oops');
    expect(failure.data).toBeNull();
    expect(failure.error).toBeInstanceOf(Error);
    expect(failure.error?.message).toBe('bad');
  });

  it('redirects 401 responses to auth login with returnTo + mode', async () => {
    fetchMock.mockResolvedValue(
      responseHelpers.jsonResponse({ message: 'Not authorized' }, 401),
    );

    const { assign, restore } = mockLocation(
      '/candidate/dashboard',
      '?tab=open',
    );

    await expect(apiClient.get('/simulations')).rejects.toMatchObject({
      status: 401,
    });

    expect(assign).toHaveBeenCalledWith(
      '/auth/login?returnTo=%2Fcandidate%2Fdashboard%3Ftab%3Dopen&mode=candidate',
    );
    expect(assign).not.toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
    );

    restore();
  });

  it('redirects 403 responses to not-authorized with context', async () => {
    fetchMock.mockResolvedValue(
      responseHelpers.jsonResponse({ message: 'Forbidden' }, 403),
    );

    const { assign, restore } = mockLocation('/dashboard');

    await expect(apiClient.post('/simulations')).rejects.toMatchObject({
      status: 403,
    });

    expect(assign).toHaveBeenCalledWith(
      '/not-authorized?mode=recruiter&returnTo=%2Fdashboard',
    );

    restore();
  });

  it('redirects recruiter pages using current path as returnTo', async () => {
    fetchMock.mockResolvedValue(
      responseHelpers.jsonResponse({ message: 'Not authorized' }, 401),
    );

    const { assign, restore } = mockLocation(
      '/dashboard/simulations/new',
      '',
    );

    await expect(apiClient.get('/simulations')).rejects.toMatchObject({
      status: 401,
    });

    expect(assign).toHaveBeenCalledWith(
      '/auth/login?returnTo=%2Fdashboard%2Fsimulations%2Fnew&mode=recruiter',
    );

    restore();
  });

  it('debounces multiple auth redirects to a single navigation', async () => {
    fetchMock
      .mockResolvedValueOnce(
        responseHelpers.jsonResponse({ message: 'Nope' }, 401),
      )
      .mockResolvedValueOnce(
        responseHelpers.jsonResponse({ message: 'Still nope' }, 401),
      );

    const { assign, restore } = mockLocation('/dashboard');

    await expect(apiClient.get('/simulations')).rejects.toMatchObject({
      status: 401,
    });
    await expect(apiClient.post('/simulations')).rejects.toMatchObject({
      status: 401,
    });

    expect(assign).toHaveBeenCalledTimes(1);

    restore();
  });

  it('is a no-op for redirects when window is unavailable (SSR/RSC)', async () => {
    const realWindow = (global as unknown as { window?: unknown }).window;
    // @ts-expect-error - simulate server environment
    delete (global as unknown as { window?: unknown }).window;

    fetchMock.mockResolvedValue(
      responseHelpers.jsonResponse({ message: 'Not authorized' }, 401),
    );

    await expect(apiClient.get('/simulations')).rejects.toMatchObject({
      status: 401,
    });

    Object.defineProperty(global, 'window', {
      configurable: true,
      value: realWindow,
    });
  });
});
