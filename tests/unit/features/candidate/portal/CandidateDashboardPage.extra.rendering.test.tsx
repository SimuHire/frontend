import { screen } from '@testing-library/react';
import {
  makeInvite,
  renderDashboardInvite,
  setupDashboardExtraTest,
} from './CandidateDashboardPage.extra.testlib';

const mockNowMs = Date.parse('2025-01-15T12:00:00Z');

jest.mock('@/shared/time/now', () => ({
  resolveNowMs: () => mockNowMs,
}));

describe('CandidateDashboardPage extra rendering coverage', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = setupDashboardExtraTest();
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(mockNowMs);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    dateNowSpy.mockRestore();
  });

  it('renders invites without company metadata', async () => {
    await renderDashboardInvite(
      makeInvite({
        title: 'No Company Sim',
        company: null,
        scheduledStartAt: '2025-01-14T00:00:00Z',
        dayWindows: [
          {
            dayIndex: 1,
            windowStartAt: '2025-01-14T00:00:00Z',
            windowEndAt: '2025-01-15T23:59:59Z',
          },
        ],
      }),
    );
    expect(screen.getByText(/the hiring team/i)).toBeInTheDocument();
  });

  it('shows progress for active trials', async () => {
    await renderDashboardInvite(
      makeInvite({
        title: 'Status Test',
        status: 'in_progress',
        progress: { completed: 1, total: 5 },
        scheduledStartAt: '2025-01-14T00:00:00Z',
        dayWindows: [
          {
            dayIndex: 1,
            windowStartAt: '2025-01-14T00:00:00Z',
            windowEndAt: '2025-01-15T23:59:59Z',
          },
        ],
      }),
    );
    expect(screen.getByText(/Progress: 1\/5/i)).toBeInTheDocument();
    expect(screen.getByText(/Day 2 of 5/i)).toBeInTheDocument();
  });

  it('normalizes legacy ten-unit progress to the five-day model', async () => {
    await renderDashboardInvite(
      makeInvite({
        title: 'Legacy Progress Sim',
        status: 'in_progress',
        progress: { completed: 10, total: 10 },
        scheduledStartAt: '2025-01-14T00:00:00Z',
        dayWindows: [
          {
            dayIndex: 1,
            windowStartAt: '2025-01-14T00:00:00Z',
            windowEndAt: '2025-01-15T23:59:59Z',
          },
        ],
      }),
    );
    expect(screen.getByText(/Progress: 5\/5/i)).toBeInTheDocument();
  });

  it('shows ended copy for terminated trials', async () => {
    await renderDashboardInvite(
      makeInvite({
        title: 'Terminated Sim',
        status: 'in_progress',
        isTerminated: true,
        terminatedAt: '2025-01-15T11:00:00Z',
        scheduledStartAt: '2025-01-01T00:00:00Z',
        dayWindows: [
          {
            dayIndex: 1,
            windowStartAt: '2025-01-01T00:00:00Z',
            windowEndAt: '2025-01-01T23:59:59Z',
          },
        ],
      }),
    );
    expect(screen.getByText(/This Trial has ended/i)).toBeInTheDocument();
  });
});
