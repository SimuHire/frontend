import type {
  CandidateCurrentDayWindow,
  CandidateDayWindow,
} from '@/features/candidate/session/api';
import Button from '@/shared/ui/Button';
import { LockedViewCountdownCard } from './LockedViewCountdownCard';
import { LockedViewDayWindows } from './LockedViewDayWindows';

type Props = {
  title: string;
  role: string;
  completedCount: number;
  currentDayIndex: number;
  lastSubmissionAt: string | null;
  countdownLabel: string;
  countdownTargetAt: string | null;
  timezone: string | null;
  scheduledStartAt: string | null;
  dayWindows: CandidateDayWindow[];
  currentDayWindow: CandidateCurrentDayWindow | null;
  errorMessage: string | null;
  onRetry: () => void;
};

export function LockedView({
  title,
  role,
  completedCount,
  currentDayIndex,
  lastSubmissionAt,
  countdownLabel,
  countdownTargetAt,
  timezone,
  scheduledStartAt,
  dayWindows,
  currentDayWindow,
  errorMessage,
  onRetry,
}: Props) {
  const hasSubmission = lastSubmissionAt !== null || completedCount > 0;
  const submittedDayIndex = Math.max(1, completedCount);
  const nextDayIndex = Math.min(
    Math.max(currentDayIndex, submittedDayIndex + 1),
    5,
  );
  const showSubmittedState = hasSubmission && nextDayIndex > 1;
  const heading = showSubmittedState
    ? `Day ${submittedDayIndex} submitted - Day ${nextDayIndex} is next`
    : 'Almost there — your Trial is scheduled';
  const description = showSubmittedState
    ? `Your Day ${submittedDayIndex} work is locked in. Day ${nextDayIndex} opens when the next window begins.`
    : `${title || 'Your Trial'}${role ? ` (${role})` : ''} stays calm and locked until Day 1 opens. Take a breath; we'll meet you at the start line.`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{heading}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      </div>

      <LockedViewCountdownCard
        countdownLabel={countdownLabel}
        countdownTargetAt={countdownTargetAt}
        timezone={timezone}
        scheduledStartAt={scheduledStartAt}
        dayIndex={currentDayWindow?.dayIndex ?? nextDayIndex}
      />

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errorMessage}
          <button className="ml-2 underline" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      <LockedViewDayWindows
        dayWindows={dayWindows}
        timezone={timezone}
        currentDayWindow={currentDayWindow}
      />

      <Button variant="secondary" onClick={onRetry}>
        Refresh
      </Button>
    </div>
  );
}
