import { render, screen } from '@testing-library/react';
import { SessionWindowBanner } from '@/features/candidate/session/components/SessionWindowBanner';
import type { DerivedWindowState } from '@/features/candidate/session/lib/windowState';

function baseWindowState(): DerivedWindowState {
  return {
    phase: 'open',
    dayIndex: 2,
    windowStartAt: '2099-01-03T14:00:00Z',
    windowEndAt: '2099-01-03T22:00:00Z',
    nextOpenAt: null,
    countdownTargetAt: null,
    countdownLabel: null,
    actionGate: {
      isReadOnly: false,
      disabledReason: null,
      comeBackAt: null,
    },
    correctedByBackend: false,
    backendDetail: null,
  };
}

describe('SessionWindowBanner', () => {
  it('renders open banner copy', () => {
    const windowState = baseWindowState();
    render(
      <SessionWindowBanner
        windowState={windowState}
        started={true}
        lastDraftSavedAt={null}
        lastSubmissionAt={null}
        lastSubmissionId={null}
      />,
    );

    expect(screen.getByText(/Day 2 open/i)).toBeInTheDocument();
  });

  it('renders started-session closed copy and comeback callout', () => {
    const windowState: DerivedWindowState = {
      ...baseWindowState(),
      phase: 'closed_before_start',
      countdownTargetAt: '2099-01-03T14:00:00Z',
      countdownLabel: '0d 00h 15m 00s',
      actionGate: {
        isReadOnly: true,
        disabledReason: 'Day 2 is closed.',
        comeBackAt: '2099-01-03T14:00:00Z',
      },
      correctedByBackend: true,
      nextOpenAt: '2099-01-03T14:00:00Z',
    };

    render(
      <SessionWindowBanner
        windowState={windowState}
        started={true}
        lastDraftSavedAt={null}
        lastSubmissionAt={null}
        lastSubmissionId={null}
      />,
    );

    expect(screen.getByText(/Day 2 is closed/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Your saved Day 2 work stays locked in/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Day 3 starts in 0d 00h 15m 00s/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Come back at/i)).toBeInTheDocument();
  });

  it('renders closed-after-end immutable copy and submission reference', () => {
    const windowState: DerivedWindowState = {
      ...baseWindowState(),
      phase: 'closed_after_end',
      actionGate: {
        isReadOnly: true,
        disabledReason: 'Day closed.',
        comeBackAt: null,
      },
    };

    render(
      <SessionWindowBanner
        windowState={windowState}
        started={true}
        lastDraftSavedAt={null}
        lastSubmissionAt={'2099-01-03T22:01:00Z'}
        lastSubmissionId={91}
      />,
    );

    expect(screen.getByText(/Day closed/i)).toBeInTheDocument();
    expect(screen.getByText(/Submission recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/ID #91/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /view recorded submission/i }),
    ).toHaveAttribute('href', '/api/submissions/91');
  });
});
