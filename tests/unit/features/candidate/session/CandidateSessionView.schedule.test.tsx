import { render, screen } from '@testing-library/react';
import { CandidateSessionView } from '@/features/candidate/session/CandidateSessionView';
import { baseScheduleProps } from './CandidateSessionView.schedule.props';

jest.mock('@/features/candidate/session/utils/scheduleUtils', () => {
  const actual = jest.requireActual<
    typeof import('@/features/candidate/session/utils/scheduleUtils')
  >('@/features/candidate/session/utils/scheduleUtils');
  return {
    ...actual,
    localTodayYmdInTimezone: () => '2026-05-17',
    plusCalendarDaysYmd: (ymd: string, days: number) =>
      actual.plusCalendarDaysYmd(ymd, days),
  };
});

jest.mock('@/shared/ui/CountdownTimer', () => ({
  CountdownTimer: () => <span data-testid="countdown-timer">2d 01h</span>,
}));

const scheduleDayLabels = [
  'Day 1 — Planning & Design Doc',
  'Day 2 — Implementation Kickoff',
  'Day 3 — Implementation Wrap-Up',
  'Day 4 — Handoff + Demo',
  'Day 5 — Reflection Essay',
];

function expectAllScheduleDays() {
  for (const label of scheduleDayLabels) {
    expect(screen.getByText(label)).toBeInTheDocument();
  }
}

describe('CandidateSessionView scheduling states', () => {
  it('renders scheduling form state', () => {
    const props = baseScheduleProps();
    const { asFragment } = render(<CandidateSessionView {...props} />);
    expect(
      screen.getByText(/Pick Day 1 on your calendar/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Day 1 start date')).toBeInTheDocument();
    expectAllScheduleDays();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders scheduling confirm state', () => {
    const props = baseScheduleProps();
    props.view = 'scheduleConfirm';
    const { asFragment } = render(<CandidateSessionView {...props} />);
    expect(screen.getByText(/5-day schedule preview/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Confirm and lock in/i }),
    ).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders locked state with countdown and day windows', () => {
    const props = baseScheduleProps();
    props.view = 'locked';
    const { asFragment } = render(<CandidateSessionView {...props} />);
    expect(
      screen.getByText(/Almost there — your Trial is scheduled/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Day 1 unlocks in/i)).toBeInTheDocument();
    expect(screen.getByTestId('countdown-timer')).toHaveTextContent('2d 01h');
    expect(screen.getByText(/5-day schedule preview/i)).toBeInTheDocument();
    expectAllScheduleDays();
    expect(screen.queryByText(/Project Brief/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Repository URL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Codespace/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Day 1 editor/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Start trial/i }),
    ).not.toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders submitted copy after Day 1 is locked in', () => {
    const props = baseScheduleProps();
    props.view = 'locked';
    props.completedCount = 1;
    props.currentDayIndex = 2;
    props.lastSubmissionAt = '2026-05-21T16:19:46.770Z';
    props.scheduleCurrentDayWindow = {
      dayIndex: 2,
      windowStartAt: '2099-01-02T14:00:00Z',
      windowEndAt: '2099-01-02T22:00:00Z',
      state: 'upcoming',
    };
    props.scheduleCountdownTargetAt = '2099-01-02T14:00:00Z';
    props.scheduleDisplayStartAt = '2099-01-02T14:00:00Z';

    render(<CandidateSessionView {...props} />);

    expect(
      screen.getByText(/Day 1 submitted - Day 2 is next/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Day 2 unlocks in/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Your Day 1 work is locked in/i),
    ).toBeInTheDocument();
  });
});
