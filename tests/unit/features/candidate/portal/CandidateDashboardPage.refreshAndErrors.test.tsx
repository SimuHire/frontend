import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  listCandidateInvitesMock,
  renderDashboardPage,
  resetDashboardPageMocks,
  useRouterMock,
} from './CandidateDashboardPage.testlib';

describe('CandidateDashboardPage refresh and error handling', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = resetDashboardPageMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows API error message on fetch failure', async () => {
    listCandidateInvitesMock.mockRejectedValue(new Error('Network error'));
    await renderDashboardPage();
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('retries invite fetch from the error banner', async () => {
    listCandidateInvitesMock.mockRejectedValueOnce(new Error('Network error'));
    await renderDashboardPage();
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
    listCandidateInvitesMock.mockResolvedValueOnce([
      {
        candidateSessionId: 2,
        title: 'Acme Trial',
        role: 'Platform Engineer',
        company: 'Acme',
        status: 'in_progress',
        isExpired: false,
        token: 'new-token',
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
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => {
      expect(screen.getByText(/Platform Engineer/i)).toBeInTheDocument();
    });
  });

  it('redirects to login when invite fetch is unauthorized', async () => {
    listCandidateInvitesMock.mockRejectedValue({ status: 401 });
    await renderDashboardPage();
    await waitFor(() => {
      expect(useRouterMock.replace).toHaveBeenCalled();
    });
  });
});
