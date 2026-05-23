import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import {
  listCandidateInvitesMock,
  renderDashboardPage,
  resetDashboardPageMocks,
  setCandidateSessionState,
  useRouterMock,
} from './CandidateDashboardPage.testlib';

const baseInvite = {
  company: 'Acme Labs',
  talentPartnerName: 'Avery',
  expiresAt: '2099-01-01T00:00:00Z',
  lastActivityAt: '2099-01-01T00:00:00Z',
  isExpired: false,
};

const pastTrialSchedule = {
  currentDayWindow: {
    dayIndex: 2,
    windowStartAt: '2020-06-02T14:00:00Z',
    windowEndAt: '2020-06-02T22:00:00Z',
    state: 'active' as const,
  },
  scheduledStartAt: '2020-06-01T14:00:00Z',
  scheduleLockedAt: '2020-05-30T12:00:00Z',
  dayWindows: [
    {
      dayIndex: 1,
      windowStartAt: '2020-06-01T14:00:00Z',
      windowEndAt: '2020-06-01T22:00:00Z',
    },
  ],
};

describe('CandidateDashboardPage navigation behavior', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = resetDashboardPageMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('navigates to invite session on continue click', async () => {
    listCandidateInvitesMock.mockResolvedValue([
      {
        ...baseInvite,
        candidateSessionId: 1,
        title: 'Continue Sim',
        role: 'Developer',
        status: 'in_progress',
        token: 'nav-token',
        ...pastTrialSchedule,
      },
    ]);
    await renderDashboardPage();
    await waitFor(() => {
      const hero = within(screen.getByRole('article')).getByRole('heading', {
        level: 2,
      });
      expect(hero.textContent).toMatch(/Developer/);
      expect(hero.textContent).toMatch(/Acme Labs/);
    });
    fireEvent.click(screen.getByRole('button', { name: /Open your Trial/i }));
    expect(useRouterMock.push).toHaveBeenCalledWith(
      '/candidate/session/nav-token',
    );
  });

  it('routes completed invites to the completed review hub', async () => {
    listCandidateInvitesMock.mockResolvedValue([
      {
        ...baseInvite,
        candidateSessionId: 2,
        title: 'Completed Sim',
        role: 'Developer',
        status: 'completed',
        completedAt: '2099-01-02T00:00:00Z',
        token: 'done-token',
      },
    ]);
    await renderDashboardPage();
    await waitFor(() => {
      const hero = within(screen.getByRole('article')).getByRole('heading', {
        level: 2,
      });
      expect(hero.textContent).toMatch(/Developer/);
      expect(hero.textContent).toMatch(/Acme Labs/);
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Review your submissions/i }),
    );
    expect(useRouterMock.push).toHaveBeenCalledWith(
      '/candidate/session/done-token/review',
    );
  });

  it('routes report-ready invites to the completed review hub', async () => {
    listCandidateInvitesMock.mockResolvedValue([
      {
        ...baseInvite,
        candidateSessionId: 3,
        title: 'Report Ready Sim',
        role: 'Developer',
        status: 'completed',
        reportReady: true,
        hasReport: true,
        completedAt: '2099-01-02T00:00:00Z',
        token: 'report-token',
      },
    ]);
    await renderDashboardPage();
    await waitFor(() => {
      const hero = within(screen.getByRole('article')).getByRole('heading', {
        level: 2,
      });
      expect(hero.textContent).toMatch(/Developer/);
      expect(hero.textContent).toMatch(/Acme Labs/);
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Review your submissions/i }),
    );
    expect(useRouterMock.push).toHaveBeenCalledWith(
      '/candidate/session/report-token/review',
    );
  });

  it('uses fallback token when invite token is missing for same session', async () => {
    setCandidateSessionState({
      candidateSessionId: 999,
      inviteToken: 'fallback-token',
    });
    listCandidateInvitesMock.mockResolvedValue([
      {
        ...baseInvite,
        candidateSessionId: 999,
        title: 'Fallback Sim',
        role: 'Developer',
        status: 'in_progress',
        token: null,
        ...pastTrialSchedule,
      },
    ]);
    await renderDashboardPage();
    const continueBtn = await screen.findByRole('button', {
      name: /Open your Trial/i,
    });
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);
    expect(useRouterMock.push).toHaveBeenCalledWith(
      '/candidate/session/fallback-token',
    );
  });

  it('surfaces missing-token error when no fallback token matches', async () => {
    setCandidateSessionState({
      candidateSessionId: 123,
      inviteToken: 'other-token',
    });
    listCandidateInvitesMock.mockResolvedValue([
      {
        ...baseInvite,
        candidateSessionId: 456,
        title: 'No Fallback Sim',
        role: 'Developer',
        status: 'in_progress',
        token: null,
        ...pastTrialSchedule,
      },
    ]);
    await renderDashboardPage();
    await waitFor(() => {
      const hero = within(screen.getByRole('article')).getByRole('heading', {
        level: 2,
      });
      expect(hero.textContent).toMatch(/Developer/);
      expect(hero.textContent).toMatch(/Acme Labs/);
    });
    fireEvent.click(screen.getByRole('button', { name: /Open your Trial/i }));
    await waitFor(() => {
      expect(screen.getByText(/Invite link unavailable/i)).toBeInTheDocument();
    });
    expect(useRouterMock.push).not.toHaveBeenCalled();
  });
});
