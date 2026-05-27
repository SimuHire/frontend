import { screen, waitFor } from '@testing-library/react';
import {
  listCandidateInvitesMock,
  renderDashboardPage,
  resetDashboardPageMocks,
} from './CandidateDashboardPage.testlib';

describe('CandidateDashboardPage content states', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = resetDashboardPageMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows loading state initially', async () => {
    listCandidateInvitesMock.mockImplementation(() => new Promise(() => {}));
    await renderDashboardPage();
    expect(screen.getByText(/Loading your Trial/)).toBeInTheDocument();
  });

  it('displays signed-in email when provided', async () => {
    listCandidateInvitesMock.mockResolvedValue([]);
    await renderDashboardPage({ signedInEmail: 'test@example.com' });
    await waitFor(() => {
      expect(
        screen.getByText(/Signed in as test@example.com/),
      ).toBeInTheDocument();
    });
  });

  it('shows empty state when no invites exist', async () => {
    listCandidateInvitesMock.mockResolvedValue([]);
    await renderDashboardPage();
    await waitFor(() => {
      expect(
        screen.getByText(/No active Trial is linked to this account yet/i),
      ).toBeInTheDocument();
    });
  });

  it('renders trial hero for the primary invite', async () => {
    listCandidateInvitesMock.mockResolvedValue([
      {
        candidateSessionId: 1,
        title: 'Test Trial',
        role: 'Developer',
        company: 'TestCo',
        status: 'in_progress',
        isExpired: false,
        token: 'invite-token',
        progress: { completed: 2, total: 5 },
        lastActivityAt: '2024-01-15T00:00:00Z',
        expiresAt: '2024-02-15T00:00:00Z',
        candidateEmail: 'test@example.com',
        talentPartnerName: 'Avery',
        scheduledStartAt: '2024-01-01T00:00:00Z',
        dayWindows: [
          {
            dayIndex: 1,
            windowStartAt: '2024-01-01T00:00:00Z',
            windowEndAt: '2024-01-01T23:59:59Z',
          },
        ],
      },
    ]);
    await renderDashboardPage({ signedInEmail: 'test@example.com' });
    await waitFor(() => {
      expect(screen.getByText(/Developer/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/TestCo/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /open your trial/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Progress: 2\/5/)).toBeInTheDocument();
  });

  it('shows pending report copy when a completed Trial is not finalized', async () => {
    listCandidateInvitesMock.mockResolvedValue([
      {
        candidateSessionId: 21,
        title: 'Pending Report Trial',
        role: 'Developer',
        company: 'TestCo',
        status: 'completed',
        isExpired: false,
        token: 'invite-token',
        progress: { completed: 5, total: 5 },
        completedAt: '2024-01-15T00:00:00Z',
        hasReport: true,
        reportReady: false,
        reportStatus: 'pending',
        reportSharedWithTalentPartner: false,
        lastActivityAt: '2024-01-15T00:00:00Z',
        expiresAt: '2024-02-15T00:00:00Z',
        candidateEmail: 'test@example.com',
      },
    ]);
    await renderDashboardPage({ signedInEmail: 'test@example.com' });

    expect(
      await screen.findByText(/Your report is being prepared/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/linked Evidence Trail/i),
    ).not.toBeInTheDocument();
  });

  it('shows reviewed and shared copy when the Winoe Report is finalized', async () => {
    listCandidateInvitesMock.mockResolvedValue([
      {
        candidateSessionId: 22,
        title: 'Finalized Report Trial',
        role: 'Developer',
        company: 'TestCo',
        status: 'completed',
        isExpired: false,
        token: 'invite-token',
        progress: { completed: 5, total: 5 },
        completedAt: '2024-01-15T00:00:00Z',
        hasReport: true,
        reportReady: true,
        reportStatus: 'finalized',
        reportSharedWithTalentPartner: true,
        lastActivityAt: '2024-01-15T00:00:00Z',
        expiresAt: '2024-02-15T00:00:00Z',
        candidateEmail: 'test@example.com',
      },
    ]);
    await renderDashboardPage({ signedInEmail: 'test@example.com' });

    expect(
      await screen.findByText(
        /Your Winoe Trial submission has been reviewed\. The Winoe Report and linked Evidence Trail have been shared with the Talent Partner\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Your report is being prepared/i),
    ).not.toBeInTheDocument();
  });

  it('filters out invites that do not belong to the signed-in email', async () => {
    listCandidateInvitesMock.mockResolvedValue([
      {
        candidateSessionId: 10,
        title: 'Other Candidate Trial',
        role: 'Developer',
        company: 'OtherCo',
        status: 'in_progress',
        isExpired: false,
        token: 'other-token',
        candidateEmail: 'other@example.com',
        scheduledStartAt: '2024-01-01T00:00:00Z',
        dayWindows: [
          {
            dayIndex: 1,
            windowStartAt: '2024-01-01T00:00:00Z',
            windowEndAt: '2024-01-01T23:59:59Z',
          },
        ],
      },
      {
        candidateSessionId: 11,
        title: 'My Trial',
        role: 'Developer',
        company: 'MyCo',
        status: 'in_progress',
        isExpired: false,
        token: 'mine-token',
        candidateEmail: 'me@example.com',
        scheduledStartAt: '2024-01-01T00:00:00Z',
        dayWindows: [
          {
            dayIndex: 1,
            windowStartAt: '2024-01-01T00:00:00Z',
            windowEndAt: '2024-01-01T23:59:59Z',
          },
        ],
      },
    ]);
    await renderDashboardPage({ signedInEmail: 'me@example.com' });
    await waitFor(() => {
      expect(screen.getByText(/MyCo/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/OtherCo/)).not.toBeInTheDocument();
  });
});
