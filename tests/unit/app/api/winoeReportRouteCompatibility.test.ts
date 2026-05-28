import { markMetadataCovered } from './coverageHelpers';
import {
  createRequest,
  mockForwardJson,
  mockTalentPartnerAuthSuccess,
  mockWithTalentPartnerAuth,
} from './withTalentPartnerAuthRoute.testlib';

describe('Winoe Report BFF route compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('keeps canonical candidate_trials generation on canonical backend path', async () => {
    mockTalentPartnerAuthSuccess('req-winoe');
    const mod =
      await import('@/app/api/candidate_trials/[candidateSessionId]/winoe_report/generate/route');
    markMetadataCovered(
      '@/app/api/candidate_trials/[candidateSessionId]/winoe_report/generate/route',
    );

    const req = await createRequest(
      'http://localhost/api/candidate_trials/2/winoe_report/generate',
    );
    await mod.POST(req as never, {
      params: Promise.resolve({ candidateSessionId: '2' }),
    });

    expect(mockWithTalentPartnerAuth).toHaveBeenCalledWith(
      req,
      {
        tag: 'winoe-report-generate',
        requirePermission: 'talent_partner:access',
      },
      expect.any(Function),
    );
    expect(mockForwardJson).toHaveBeenCalledWith({
      path: '/api/candidate_trials/2/winoe_report/generate',
      method: 'POST',
      cache: 'no-store',
      accessToken: 'token',
      requestId: 'req-winoe',
    });
  });

  it('keeps legacy candidate_sessions wrapper forwarding to canonical backend path', async () => {
    mockTalentPartnerAuthSuccess('req-legacy-winoe');
    const mod =
      await import('@/app/api/candidate_sessions/[candidateSessionId]/winoe_report/generate/route');
    markMetadataCovered(
      '@/app/api/candidate_sessions/[candidateSessionId]/winoe_report/generate/route',
    );

    const req = await createRequest(
      'http://localhost/api/candidate_sessions/legacy-id/winoe_report/generate',
    );
    await mod.POST(req as never, {
      params: Promise.resolve({ candidateSessionId: 'legacy-id' }),
    });

    expect(mockForwardJson).toHaveBeenCalledWith({
      path: '/api/candidate_trials/legacy-id/winoe_report/generate',
      method: 'POST',
      cache: 'no-store',
      accessToken: 'token',
      requestId: 'req-legacy-winoe',
    });
  });
});
