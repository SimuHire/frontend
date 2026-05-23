import {
  isAuth0HandlerPath,
  isPublicPath,
  requiresCandidateAccess,
  requiresTalentPartnerAccess,
  shouldSkipAuth,
} from '@/platform/auth/proxyUtils';
import { modeForPath } from '@/platform/auth/routing';

describe('proxyUtils public paths', () => {
  it('treats /invite/{token} as public', () => {
    expect(isPublicPath('/invite/some-token')).toBe(true);
    expect(shouldSkipAuth('/invite/some-token')).toBe(true);
  });

  it('uses candidate auth mode for /invite paths', () => {
    expect(modeForPath('/invite/some-token')).toBe('candidate');
  });

  it('keeps talent partner routes protected', () => {
    expect(isPublicPath('/dashboard')).toBe(false);
    expect(shouldSkipAuth('/dashboard')).toBe(false);
    expect(requiresTalentPartnerAccess('/dashboard')).toBe(true);
    expect(modeForPath('/dashboard')).toBe('talent_partner');
  });

  it('keeps canonical candidate routes protected', () => {
    expect(isPublicPath('/candidate/portal')).toBe(false);
    expect(shouldSkipAuth('/candidate/session/abc')).toBe(false);
    expect(requiresCandidateAccess('/candidate/session/abc')).toBe(true);
  });

  it('treats Auth0 handler routes as skip-auth but not public pages', () => {
    expect(isAuth0HandlerPath('/auth/start')).toBe(true);
    expect(shouldSkipAuth('/auth/start')).toBe(true);
    expect(isPublicPath('/auth/start')).toBe(false);
    expect(isAuth0HandlerPath('/auth/callback')).toBe(true);
  });

  it('does not treat /auth/login page as an Auth0 handler route', () => {
    expect(isAuth0HandlerPath('/auth/login')).toBe(false);
    expect(isPublicPath('/auth/login')).toBe(true);
  });

  it('treats unknown /auth/* auxiliary routes as skip-auth', () => {
    expect(shouldSkipAuth('/auth/reset')).toBe(true);
    expect(isPublicPath('/auth/reset')).toBe(false);
  });
});
