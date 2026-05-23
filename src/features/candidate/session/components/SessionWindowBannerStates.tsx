import {
  formatLocalDateTime,
  formatLocalTime,
  type DerivedWindowState,
} from '../lib/windowState';

type SessionWindowOpenBannerProps = {
  windowState: DerivedWindowState;
};

type SessionWindowClosedBeforeStartBannerProps = {
  windowState: DerivedWindowState;
  started: boolean;
  lastDraftSavedAt: number | null;
  lastSubmissionAt: string | null;
  lastSubmissionId: number | null;
};

function formatDraftSavedAt(value: number | null): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function SessionWindowOpenBanner({
  windowState,
}: SessionWindowOpenBannerProps) {
  const closeTime = formatLocalTime(windowState.windowEndAt);
  const closeAt = formatLocalDateTime(windowState.windowEndAt);

  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
      <p className="text-sm font-semibold">
        Day {windowState.dayIndex} open
        {closeTime ? ` until ${closeTime}` : ''}
      </p>
      {closeAt ? <p className="mt-1 text-xs">Closes {closeAt}</p> : null}
    </div>
  );
}

export function SessionWindowClosedBeforeStartBanner({
  windowState,
  started,
  lastDraftSavedAt,
  lastSubmissionAt,
  lastSubmissionId,
}: SessionWindowClosedBeforeStartBannerProps) {
  const openAt = formatLocalDateTime(
    windowState.countdownTargetAt ?? windowState.windowStartAt,
  );
  const comeBackAt = formatLocalDateTime(windowState.actionGate.comeBackAt);
  const hasSubmission = lastSubmissionAt !== null || lastSubmissionId !== null;
  const dayLabel =
    windowState.dayIndex === null ? 'This day' : `Day ${windowState.dayIndex}`;
  const nextDayLabel =
    windowState.dayIndex !== null && windowState.dayIndex < 5
      ? `Day ${windowState.dayIndex + 1}`
      : 'Next window';
  const showScheduledCopy = !started;
  const heading = showScheduledCopy
    ? 'Almost there — your Trial is scheduled'
    : hasSubmission
      ? `${dayLabel} submitted — ${nextDayLabel} is next`
      : `${dayLabel} is closed`;
  const bodyText = showScheduledCopy
    ? openAt
      ? `Day 1 unlocks on ${openAt}`
      : 'Day 1 unlocks soon.'
    : hasSubmission
      ? `Your ${dayLabel} work is locked in.`
      : `Your saved ${dayLabel} work stays locked in.`;
  const countdownText =
    !showScheduledCopy && windowState.countdownLabel
      ? `${nextDayLabel} starts in ${windowState.countdownLabel}`
      : !showScheduledCopy && openAt
        ? `${nextDayLabel} unlocks on ${openAt}`
        : null;
  const draftSavedText =
    !showScheduledCopy && lastDraftSavedAt
      ? `Draft saved ${formatDraftSavedAt(lastDraftSavedAt)}.`
      : null;

  return (
    <div
      aria-live="polite"
      className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
    >
      <p className="text-sm font-semibold">{heading}</p>
      <p className="mt-1 text-xs">{bodyText}</p>
      {countdownText ? <p className="mt-1 text-xs">{countdownText}</p> : null}
      {draftSavedText ? <p className="mt-1 text-xs">{draftSavedText}</p> : null}
      {windowState.correctedByBackend && comeBackAt ? (
        <p className="mt-2 rounded border border-amber-300 bg-amber-100 px-2 py-1 text-xs font-medium">
          Come back at {comeBackAt}
        </p>
      ) : null}
    </div>
  );
}
