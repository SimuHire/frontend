import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type RateLimitRule = {
  limit: number;
  windowMs: number;
};

const AUTH_START_RULE: RateLimitRule = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
};

const buckets = new Map<string, number[]>();

function clientKey(request: NextRequest) {
  const forwardedFor = request.headers?.get('x-forwarded-for') ?? '';
  const realIp = request.headers?.get('x-real-ip') ?? '';
  const client = forwardedFor.split(',')[0]?.trim() || realIp || 'unknown';
  const mode = request.nextUrl.searchParams.get('mode') ?? 'default';
  const connection =
    request.nextUrl.searchParams.get('connection') ?? 'default';
  return ['auth_start', client, mode, connection].join(':');
}

function allow(key: string, rule: RateLimitRule, now = Date.now()) {
  const existing = buckets.get(key) ?? [];
  const active = existing.filter(
    (timestamp) => now - timestamp <= rule.windowMs,
  );
  if (active.length >= rule.limit) {
    buckets.set(key, active);
    return false;
  }
  active.push(now);
  buckets.set(key, active);
  return true;
}

export function authStartRateLimit(request: NextRequest) {
  if (request.nextUrl.pathname !== '/auth/start') return null;
  if (allow(clientKey(request), AUTH_START_RULE)) return null;
  return NextResponse.json(
    { message: 'Too many sign-in attempts. Please wait and try again.' },
    { status: 429 },
  );
}

export function __resetMiddlewareRateLimitsForTests() {
  buckets.clear();
}
