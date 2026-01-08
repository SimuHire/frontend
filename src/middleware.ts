import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth0, getSessionNormalized } from './lib/auth0';
import { extractPermissions, hasPermission } from './lib/auth0-claims';
import { mergeResponseCookies } from './lib/server/bffAuth';

const PUBLIC_PATHS = new Set([
  '/',
  '/auth/login',
  '/auth/logout',
  '/not-authorized',
]);
const PUBLIC_PREFIXES = ['/auth'];
const CANDIDATE_PREFIXES = ['/candidate-sessions', '/candidate'];
const RECRUITER_PREFIXES = ['/dashboard'];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirect(to: string, request: NextRequest) {
  return NextResponse.redirect(new URL(to, request.url));
}

function buildLoginRedirect(request: NextRequest) {
  const url = new URL('/auth/login', request.url);
  url.searchParams.set(
    'returnTo',
    request.nextUrl.pathname + request.nextUrl.search,
  );
  url.searchParams.set('mode', loginModeForPath(request.nextUrl.pathname));
  return NextResponse.redirect(url);
}

function shouldSkipAuth(pathname: string) {
  if (isPublicPath(pathname)) return true;
  return false;
}

function requiresCandidateAccess(pathname: string) {
  return CANDIDATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function requiresRecruiterAccess(pathname: string) {
  return RECRUITER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function loginModeForPath(pathname: string): 'candidate' | 'recruiter' {
  return requiresCandidateAccess(pathname) ? 'candidate' : 'recruiter';
}

function redirectNotAuthorized(
  mode: 'candidate' | 'recruiter',
  request: NextRequest,
) {
  const url = new URL('/not-authorized', request.url);
  url.searchParams.set('mode', mode);
  url.searchParams.set(
    'returnTo',
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(url);
}

function normalizeAccessToken(raw: unknown): string | null {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object') {
    const maybeToken =
      (raw as { token?: unknown }).token ??
      (raw as { accessToken?: unknown }).accessToken;
    return typeof maybeToken === 'string' ? maybeToken : null;
  }
  return null;
}

function isNextResponse(value: unknown): value is NextResponse {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'status' in (value as Record<string, unknown>) &&
    typeof (value as { status: unknown }).status === 'number' &&
    'cookies' in (value as Record<string, unknown>) &&
    typeof (value as { cookies?: unknown }).cookies === 'object' &&
    typeof (value as { cookies: { getAll?: unknown } }).cookies.getAll ===
      'function' &&
    'headers' in (value as Record<string, unknown>) &&
    typeof (value as { headers?: unknown }).headers === 'object' &&
    typeof (value as { headers: { get?: unknown } }).headers.get === 'function',
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiPath = pathname === '/api' || pathname.startsWith('/api/');

  const authResponse = await auth0.middleware(request);
  const responder = (resp: NextResponse) => {
    if (isNextResponse(authResponse)) {
      mergeResponseCookies(authResponse, resp);
    }
    return resp;
  };

  if (isApiPath) {
    return responder(NextResponse.next());
  }

  const isRootOrLogin = pathname === '/' || pathname === '/auth/login';

  if (shouldSkipAuth(pathname) && !isRootOrLogin) {
    const pass = isNextResponse(authResponse)
      ? (authResponse as NextResponse)
      : NextResponse.next();
    return responder(pass);
  }

  const session = await getSessionNormalized(request);

  if (shouldSkipAuth(pathname)) {
    if (session && isRootOrLogin) {
      const perms = extractPermissions(
        session.user,
        normalizeAccessToken(
          (session as { accessToken?: unknown }).accessToken,
        ),
      );
      if (hasPermission(perms, 'recruiter:access')) {
        return responder(redirect('/dashboard', request));
      }
      if (hasPermission(perms, 'candidate:access')) {
        return responder(redirect('/candidate/dashboard', request));
      }
    }
    const pass = isNextResponse(authResponse)
      ? (authResponse as NextResponse)
      : NextResponse.next();
    return responder(pass);
  }

  if (!session) return responder(buildLoginRedirect(request));

  const fallbackAccessToken = normalizeAccessToken(
    (session as { accessToken?: unknown }).accessToken,
  );
  const permissions = extractPermissions(session.user, fallbackAccessToken);
  const wantsRecruiter = requiresRecruiterAccess(pathname);
  const wantsCandidate = requiresCandidateAccess(pathname);

  if (wantsRecruiter && !hasPermission(permissions, 'recruiter:access')) {
    return responder(redirectNotAuthorized('recruiter', request));
  }

  if (wantsCandidate && !hasPermission(permissions, 'candidate:access')) {
    return responder(redirectNotAuthorized('candidate', request));
  }

  const pass = isNextResponse(authResponse)
    ? (authResponse as NextResponse)
    : NextResponse.next();
  return responder(pass);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
