import {
  isPublicBackendProxyPath,
  normalizePath,
} from '@/platform/server/backendProxy/requestSecurity.path';

describe('isPublicBackendProxyPath', () => {
  it('allows unauthenticated invite summary proxy', () => {
    expect(
      isPublicBackendProxyPath([
        'candidate',
        'invite-tokens',
        'some-token',
        'summary',
      ]),
    ).toBe(true);
    expect(
      normalizePath(['candidate', 'invite-tokens', 'tok', 'summary']),
    ).toBe('candidate/invite-tokens/tok/summary');
  });

  it('keeps protected candidate routes private', () => {
    expect(isPublicBackendProxyPath(['candidate', 'invites'])).toBe(false);
    expect(isPublicBackendProxyPath(['candidate', 'session', 'token-1'])).toBe(
      false,
    );
  });
});
