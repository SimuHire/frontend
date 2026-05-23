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

describe('CandidateDashboardPage invite-specific states', () => {
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

  it('prompts to schedule when no start date is set', async () => {
    await renderDashboardInvite(
      makeInvite({ status: 'not_started', progress: null }),
    );
    expect(
      screen.getByRole('button', { name: /schedule your start date/i }),
    ).toBeInTheDocument();
  });

  it('shows countdown before Day 1 unlocks', async () => {
    await renderDashboardInvite(
      makeInvite({
        status: 'in_progress',
        scheduledStartAt: '2025-01-16T00:00:00Z',
        dayWindows: [
          {
            dayIndex: 1,
            windowStartAt: '2025-01-16T00:00:00Z',
            windowEndAt: '2025-01-16T23:59:59Z',
          },
        ],
      }),
    );
    expect(screen.getByText(/Day 1 unlocks in/i)).toBeInTheDocument();
  });

  it('shows active trial CTA when the window is open', async () => {
    await renderDashboardInvite(
      makeInvite({
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
    expect(
      screen.getByRole('button', { name: /open your trial/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Day 2 of 5/i)).toBeInTheDocument();
  });

  it('shows completed review CTA', async () => {
    await renderDashboardInvite(
      makeInvite({
        status: 'completed',
        progress: { completed: 5, total: 5 },
        completedAt: '2025-01-15T10:00:00Z',
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
    expect(
      screen.getByRole('button', { name: /review your submissions/i }),
    ).toBeInTheDocument();
  });

  it('shows ended copy for terminated trials', async () => {
    await renderDashboardInvite(
      makeInvite({
        status: 'in_progress',
        terminatedAt: '2025-01-15T11:00:00Z',
        isTerminated: true,
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
