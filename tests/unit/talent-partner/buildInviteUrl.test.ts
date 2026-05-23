import { buildInviteUrl } from '@/features/talent-partner/api/candidateNormalizeHelpersApi';

describe('buildInviteUrl', () => {
  const globalAny = globalThis as Record<string, unknown>;
  let originalWindow: Window | undefined;

  beforeEach(() => {
    originalWindow = globalAny.window as Window | undefined;
    delete globalAny.window;
  });

  afterEach(() => {
    if (originalWindow) globalAny.window = originalWindow;
    else delete globalAny.window;
  });

  it('uses the public invite claim route', () => {
    expect(buildInviteUrl('token-123')).toBe('/invite/token-123');
  });

  it('encodes unsafe token characters in the path', () => {
    expect(buildInviteUrl('tok/en')).toBe('/invite/tok%2Fen');
  });

  it('prefixes window origin when available', () => {
    globalAny.window = { location: { origin: 'https://app.test' } } as Window;
    expect(buildInviteUrl('token-123')).toBe(
      'https://app.test/invite/token-123',
    );
  });
});
