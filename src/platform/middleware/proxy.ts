import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth0, getSessionNormalized } from '@/platform/auth0';
import { extractPermissions } from '@/platform/auth0/claims';
import {
  isAuth0HandlerPath,
  isNextResponse,
  normalizeAccessToken,
  redirectToLogin,
  requiresProtectedAccess,
  shouldSkipAuth,
} from '@/platform/auth/proxyUtils';
import { modeForPath } from '@/platform/auth/routing';
import { normalizeLogoutRedirect } from './redirects';
import { buildResponder, startPerfTimer } from './perf';
import { redirectSignedInHome, gateByRole } from './auth';
import { authStartRateLimit } from './rateLimit';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|site.webmanifest|sitemap.xml|robots.txt).*)',
  ],
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (
    pathname === '/candidate-sessions' ||
    pathname.startsWith('/candidate-sessions/')
  ) {
    return NextResponse.next();
  }
  const isStaticAsset =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/.well-known/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/site.webmanifest' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    /\.(?:css|js|map|png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|ttf|eot)$/.test(
      pathname,
    );
  if (isStaticAsset) {
    return NextResponse.next();
  }
  const isApiPath = pathname === '/api' || pathname.startsWith('/api/');
  const logoutRedirect = normalizeLogoutRedirect(request);
  if (logoutRedirect) return logoutRedirect;
  const authRateLimit = authStartRateLimit(request);
  if (authRateLimit) return authRateLimit;
  const perfStart = startPerfTimer();
  const authResponse = await auth0.middleware(request);
  const responder = buildResponder({ authResponse, pathname, perfStart });
  const passThrough = () =>
    isNextResponse(authResponse)
      ? (authResponse as NextResponse)
      : NextResponse.next();
  const publicPassThrough = () => NextResponse.next();

  if (isApiPath) return responder(NextResponse.next());
  const isRootOrLogin =
    pathname === '/' || pathname === '/auth/login' || pathname === '/login';
  if (shouldSkipAuth(pathname) && !isRootOrLogin) {
    if (isAuth0HandlerPath(pathname)) {
      return responder(passThrough());
    }
    return responder(publicPassThrough());
  }

  const session = await getSessionNormalized(request);
  if (shouldSkipAuth(pathname)) {
    const homeRedirect = redirectSignedInHome(session, isRootOrLogin, request);
    if (homeRedirect) return responder(homeRedirect);
    return responder(publicPassThrough());
  }
  if (!requiresProtectedAccess(pathname)) {
    return responder(publicPassThrough());
  }
  if (!session)
    return responder(
      redirectToLogin(request, modeForPath(request.nextUrl.pathname)),
    );

  const fallbackAccessToken = normalizeAccessToken(
    (session as { accessToken?: unknown }).accessToken,
  );
  const permissions = extractPermissions(session.user, fallbackAccessToken);
  const roleRedirect = gateByRole(pathname, permissions, request);
  if (roleRedirect) return responder(roleRedirect);

  return responder(passThrough());
}
