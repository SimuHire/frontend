import { render, waitFor } from '@testing-library/react';
import { useCandidateSessionScheduleViewState } from '@/features/candidate/session/hooks/controller/useCandidateSessionScheduleViewState';

jest.mock('@/shared/time/now', () => ({
  resolveNowMs: () => Date.parse('2099-01-01T14:05:00Z'),
}));

type HarnessProps = {
  view: 'locked' | 'loading';
  runInit: jest.Mock;
};

function Harness({ view, runInit }: HarnessProps) {
  useCandidateSessionScheduleViewState({
    token: 'pre-day-token',
    view,
    runInit,
    scheduleTimezoneValue: 'America/New_York',
    bootstrap: {
      candidateSessionId: 655,
      status: 'in_progress',
      trial: { title: 'Infra Trial', role: 'Backend Engineer' },
      aiNoticeText: 'Notice',
      aiNoticeVersion: 'v1',
      evalEnabledByDay: {},
      scheduledStartAt: '2099-01-01T14:00:00Z',
      candidateTimezone: 'America/New_York',
      scheduleLockedAt: '2098-12-01T14:00:00Z',
      dayWindows: [
        {
          dayIndex: 1,
          windowStartAt: '2099-01-01T14:00:00Z',
          windowEndAt: '2099-01-01T22:00:00Z',
        },
      ],
      currentDayWindow: {
        dayIndex: 1,
        windowStartAt: '2099-01-01T14:00:00Z',
        windowEndAt: '2099-01-01T22:00:00Z',
        state: 'upcoming',
      },
    },
  });
  return null;
}

describe('useCandidateSessionScheduleViewState', () => {
  it('does not loop unlock refresh while bootstrap is reloading', async () => {
    const runInit = jest.fn();
    const { rerender } = render(<Harness view="locked" runInit={runInit} />);

    await waitFor(() => expect(runInit).toHaveBeenCalledTimes(1));

    rerender(<Harness view="loading" runInit={runInit} />);
    rerender(<Harness view="locked" runInit={runInit} />);

    await new Promise((resolve) => window.setTimeout(resolve, 50));
    expect(runInit).toHaveBeenCalledTimes(1);
  });
});
