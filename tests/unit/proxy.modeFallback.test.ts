import {
  NextRequest,
  getSessionNormalizedMock,
  proxy,
  resetProxyTestMocks,
} from './proxy.testlib';

describe('proxy - mode fallback', () => {
  beforeEach(resetProxyTestMocks);

  it('lets unknown unauthenticated routes reach branded 404 rendering', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);

    const res = await proxy(
      new NextRequest(new URL('http://localhost/unknown')),
    );
    expect(res?.status).toBe(200);
    expect(res?.headers.get('location')).toBeNull();
    expect(getSessionNormalizedMock).toHaveBeenCalled();
  });

  it('lets unknown authenticated routes reach branded 404 rendering', async () => {
    getSessionNormalizedMock.mockResolvedValue({
      user: { permissions: ['talent_partner:access'] },
    });

    const res = await proxy(
      new NextRequest(new URL('http://localhost/no-such-route-for-qa')),
    );
    expect(res?.status).toBe(200);
    expect(res?.headers.get('location')).toBeNull();
  });
});
