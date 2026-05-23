import { formatDate, formatTime } from './lockedView.format';
import { CountdownTimer } from '@/shared/ui/CountdownTimer';

type Props = {
  countdownLabel: string;
  countdownTargetAt: string | null;
  timezone: string | null;
  scheduledStartAt: string | null;
  dayIndex: number | null;
};

export function LockedViewCountdownCard({
  countdownLabel,
  countdownTargetAt,
  timezone,
  scheduledStartAt,
  dayIndex,
}: Props) {
  const target = countdownTargetAt || scheduledStartAt;
  const labelDayIndex = dayIndex && dayIndex > 0 ? dayIndex : 1;
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-wheat-100 bg-wheat-50/70 px-8 py-10 text-center text-wheat-950">
      <p className="text-sm font-medium text-wheat-900">
        Day {labelDayIndex} unlocks in
      </p>
      {target ? (
        <div className="mt-4 flex justify-center">
          <CountdownTimer mode="large" targetAt={target} />
        </div>
      ) : (
        <p className="mt-4 text-2xl font-semibold tabular-nums text-gray-900">
          {countdownLabel}
        </p>
      )}
      <p className="mt-6 text-xs text-wheat-800">
        We&apos;ll email you when it begins.
      </p>
      {target && timezone ? (
        <p className="mt-3 text-xs text-wheat-800 tabular-nums">
          {formatDate(target, timezone)} · {formatTime(target, timezone)} ·{' '}
          {timezone}
        </p>
      ) : null}
    </div>
  );
}
