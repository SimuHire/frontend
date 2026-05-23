import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CandidateDashboardPage, {
  extractInviteToken,
} from '@/features/candidate/portal/CandidateDashboardPage';
import { CandidateSessionProvider } from '@/features/candidate/session/CandidateSessionProvider';
import { listCandidateInvites } from '@/features/candidate/session/api';

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

const listInvitesMock = listCandidateInvites as jest.Mock;

function renderPage(signedInEmail: string | null = 'candidate@example.com') {
  return render(
    <CandidateSessionProvider>
      <CandidateDashboardPage signedInEmail={signedInEmail} />
    </CandidateSessionProvider>,
  );
}

const activeScheduleFields = {
  scheduledStartAt: '2024-01-01T00:00:00Z',
  dayWindows: [
    {
      dayIndex: 1,
      windowStartAt: '2024-01-01T00:00:00Z',
      windowEndAt: '2025-12-31T23:59:59Z',
    },
  ],
};

describe('CandidateDashboardPage', () => {
  beforeEach(() => {
    Object.values(routerMock).forEach((fn) => fn.mockReset());
    listInvitesMock.mockReset();
    listInvitesMock.mockResolvedValue([]);
    sessionStorage.clear();
  });

  it('shows trial hero with continue CTA', async () => {
    listInvitesMock.mockResolvedValue([
      {
        candidateSessionId: 1,
        token: 'INV123',
        title: 'Infra Trial',
        role: 'Backend Engineer',
        company: 'Winoe',
        status: 'in_progress',
        progress: { completed: 2, total: 5 },
        expiresAt: '2025-01-01',
        lastActivityAt: '2024-12-12',
        isExpired: false,
        ...activeScheduleFields,
      },
    ]);
    renderPage();
    expect(await screen.findByText(/Backend Engineer/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /open your trial/i }));
    expect(routerMock.push).toHaveBeenCalledWith('/candidate/session/INV123');
  });

  it('shows empty state when no invites', async () => {
    listInvitesMock.mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/No active Trial is linked to this account yet/i),
      ).toBeInTheDocument(),
    );
  });

  it('surfaces expired invite errors when continuing', async () => {
    listInvitesMock.mockResolvedValue([
      {
        candidateSessionId: 1,
        token: 'INV999',
        title: 'Old Trial',
        role: 'Backend',
        company: null,
        status: 'expired',
        progress: null,
        expiresAt: '2024-01-01',
        lastActivityAt: '2024-01-02',
        isExpired: true,
        ...activeScheduleFields,
      },
    ]);
    renderPage();
    expect(await screen.findByText(/Backend/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /open your trial/i }));
    await waitFor(() =>
      expect(screen.getByText(/This invite has expired/i)).toBeInTheDocument(),
    );
  });

  it('redirects to login when invite lookup returns 401', async () => {
    listInvitesMock.mockRejectedValueOnce({ status: 401 });
    renderPage(null);
    await waitFor(() => expect(listInvitesMock).toHaveBeenCalled());
    expect(routerMock.replace).toHaveBeenCalled();
  });

  it('parses canonical invite links and navigates', () => {
    expect(
      extractInviteToken('https://app.test/candidate/session/INV123'),
    ).toBe('INV123');
  });

  it('parses legacy invite links and normalizes to canonical route', () => {
    expect(
      extractInviteToken('https://app.test/candidate-sessions/INV123'),
    ).toBe('INV123');
  });

  it('strips query/hash when parsing raw tokens', () => {
    expect(extractInviteToken(' INV123?utm=1 ')).toBe('INV123');
    expect(extractInviteToken('INV123#frag')).toBe('INV123');
  });
});
