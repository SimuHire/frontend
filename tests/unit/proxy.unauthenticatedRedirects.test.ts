import {
  NextRequest,
  NextResponse,
  getSessionNormalizedMock,
  mockAuth0,
  proxy,
  resetProxyTestMocks,
} from './proxy.testlib';

describe('proxy - unauthenticated redirects', () => {
  beforeEach(resetProxyTestMocks);

  it('redirects unauthenticated candidate dashboard access to login', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    const req = new NextRequest(
      new URL('http://localhost/candidate/dashboard'),
    );
    const res = await proxy(req);
    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toBe(
      'http://localhost/auth/login?mode=candidate&returnTo=%2Fcandidate%2Fdashboard',
    );
    expect(getSessionNormalizedMock).toHaveBeenCalled();
  });

  it('redirects unauthenticated talent partner dashboard to login with mode', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    const res = await proxy(
      new NextRequest(new URL('http://localhost/dashboard')),
    );
    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toBe(
      'http://localhost/auth/login?mode=talent_partner&returnTo=%2Fdashboard',
    );
  });

  it('redirects unauthenticated canonical Talent Partner routes to login with mode', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    const res = await proxy(
      new NextRequest(new URL('http://localhost/talent-partner/trials')),
    );
    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toBe(
      'http://localhost/auth/login?mode=talent_partner&returnTo=%2Ftalent-partner%2Ftrials',
    );
  });

  it('allows logged-out access to /invite/{token} without talent partner login redirect', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    const res = await proxy(
      new NextRequest(new URL('http://localhost/invite/some-token')),
    );
    expect(res?.status).toBe(200);
    expect(res?.headers.get('location')).toBeNull();
    expect(getSessionNormalizedMock).not.toHaveBeenCalled();
  });

  it('forwards /auth/start to Auth0 middleware instead of public pass-through', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    const auth0Redirect = NextResponse.redirect(
      new URL('https://auth.example.com/authorize'),
    );
    mockAuth0.middleware.mockReturnValueOnce(auth0Redirect);
    const res = await proxy(
      new NextRequest(
        new URL(
          'http://localhost/auth/start?returnTo=%2Finvite%2Ftok&mode=candidate&connection=Winoe-Candidates',
        ),
      ),
    );
    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toBe(
      'https://auth.example.com/authorize',
    );
    expect(getSessionNormalizedMock).not.toHaveBeenCalled();
  });

  it('rate limits repeated auth starts by login mode and connection', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    for (let idx = 0; idx < 5; idx += 1) {
      const allowed = await proxy(
        new NextRequest(
          new URL(
            'http://localhost/auth/start?mode=talent_partner&connection=Winoe-TalentPartners',
          ),
        ),
      );
      expect(allowed?.status).toBe(200);
    }

    const blocked = await proxy(
      new NextRequest(
        new URL(
          'http://localhost/auth/start?mode=talent_partner&connection=Winoe-TalentPartners',
        ),
      ),
    );
    expect(blocked?.status).toBe(429);

    const separateMode = await proxy(
      new NextRequest(
        new URL(
          'http://localhost/auth/start?mode=candidate&connection=Winoe-Candidates',
        ),
      ),
    );
    expect(separateMode?.status).toBe(200);
  });

  it('keys auth start rate limits by forwarded client IP', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    for (let idx = 0; idx < 5; idx += 1) {
      const req = new NextRequest(
        new URL('http://localhost/auth/start?mode=candidate'),
      );
      req.headers.set('x-forwarded-for', '203.0.113.10, 10.0.0.5');
      const allowed = await proxy(req);
      expect(allowed?.status).toBe(200);
    }

    const blockedReq = new NextRequest(
      new URL('http://localhost/auth/start?mode=candidate'),
    );
    blockedReq.headers.set('x-forwarded-for', '203.0.113.10, 10.0.0.5');
    const blocked = await proxy(blockedReq);
    expect(blocked?.status).toBe(429);

    const separateIpReq = new NextRequest(
      new URL('http://localhost/auth/start?mode=candidate'),
    );
    separateIpReq.headers.set('x-forwarded-for', '203.0.113.11, 10.0.0.5');
    const separateIp = await proxy(separateIpReq);
    expect(separateIp?.status).toBe(200);
  });

  it('does not start Auth0 login from the public login page itself', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    const res = await proxy(
      new NextRequest(new URL('http://localhost/auth/login?mode=candidate')),
    );

    expect(res?.status).toBe(200);
    expect(mockAuth0.middleware).toHaveBeenCalled();
    expect(getSessionNormalizedMock).toHaveBeenCalled();
  });

  it('ignores Auth0 middleware login redirect for public /invite/{token}', async () => {
    getSessionNormalizedMock.mockResolvedValue(null);
    mockAuth0.middleware.mockReturnValueOnce(
      NextResponse.redirect(
        new URL(
          'http://localhost/auth/login?mode=talent_partner&returnTo=%2Finvite%2Fsome-token',
        ),
      ),
    );
    const res = await proxy(
      new NextRequest(new URL('http://localhost/invite/some-token')),
    );
    expect(res?.status).toBe(200);
    expect(res?.headers.get('location')).toBeNull();
    expect(getSessionNormalizedMock).not.toHaveBeenCalled();
  });
});
