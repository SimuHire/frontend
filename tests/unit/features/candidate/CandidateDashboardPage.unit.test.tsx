import { render, screen, waitFor } from '@testing-library/react';
import CandidateDashboardPage from '@/features/candidate/portal/CandidateDashboardPage';
import { useCandidateSession } from '@/features/candidate/session/CandidateSessionProvider';
import { listCandidateInvites } from '@/features/candidate/session/api';
import {
  fallbackInvite,
  sortedInvites,
} from './CandidateDashboardPage.unit.fixtures';

jest.mock('@/features/candidate/session/CandidateSessionProvider', () => ({
  useCandidateSession: jest.fn(),
}));

jest.mock('@/features/candidate/session/api', () => ({
  listCandidateInvites: jest.fn(),
}));

const routerMock = {
  push: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseCandidateSession = useCandidateSession as jest.Mock;
const listInvitesMock = listCandidateInvites as jest.Mock;

const buildSession = (overrides?: {
  token?: string | null;
  authStatus?: 'idle' | 'loading' | 'ready' | 'unauthenticated' | 'error';
  inviteToken?: string | null;
  candidateSessionId?: number | null;
}) => ({
  state: {
    inviteToken: overrides?.inviteToken ?? 'fallback-token',
    token: overrides?.token ?? 'auth-token',
    candidateSessionId: overrides?.candidateSessionId ?? 1,
    bootstrap: null,
    started: false,
    taskState: {
      loading: false,
      error: null,
      isComplete: false,
      completedTaskIds: [],
      currentTask: null,
    },
    authStatus: overrides?.authStatus ?? 'ready',
    authError: null,
  },
  loadAccessToken: jest.fn(),
});

const activeScheduleFields = {
  scheduledStartAt: '2025-01-14T00:00:00Z',
  dayWindows: [
    {
      dayIndex: 1,
      windowStartAt: '2025-01-14T00:00:00Z',
      windowEndAt: '2025-12-31T23:59:59Z',
    },
  ],
};

describe('CandidateDashboardPage unit flow', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseCandidateSession.mockReturnValue(buildSession());
  });

  it('surfaces invite load errors', async () => {
    listInvitesMock.mockRejectedValueOnce(new Error('load fail'));

    render(<CandidateDashboardPage signedInEmail="c@example.com" />);

    await waitFor(() =>
      expect(screen.getByText('load fail')).toBeInTheDocument(),
    );
  });

  it('shows the most recent invite in the hero', async () => {
    listInvitesMock.mockResolvedValueOnce(
      sortedInvites.map((invite) => ({ ...invite, ...activeScheduleFields })),
    );

    render(<CandidateDashboardPage signedInEmail="c@example.com" />);

    await screen.findByRole('button', { name: /open your trial/i });
    expect(
      screen.getByText(/more than one Trial on this account/i),
    ).toBeInTheDocument();
  });

  it('shows unavailable invite link when token is missing', async () => {
    listInvitesMock.mockResolvedValueOnce([fallbackInvite]);

    render(<CandidateDashboardPage signedInEmail="c@example.com" />);

    expect(
      await screen.findByText(/Invite link unavailable/i),
    ).toBeInTheDocument();
  });
});
