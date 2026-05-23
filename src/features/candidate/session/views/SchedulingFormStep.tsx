import { useMemo } from 'react';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import {
  isValidIanaTimezone,
  localTodayYmdInTimezone,
  plusCalendarDaysYmd,
} from '../utils/scheduleUtils';
import type { SchedulingViewProps } from './SchedulingView.types';
import {
  formatScheduleDate,
  formatScheduleTime,
  formatScheduleTimeRange,
  SCHEDULE_DAY_LABELS,
} from './SchedulingView.format';

type SchedulingFormStepProps = Pick<
  SchedulingViewProps,
  | 'scheduleDate'
  | 'scheduleTimezone'
  | 'scheduleGithubUsername'
  | 'scheduleIncludeWeekends'
  | 'scheduleTimezoneDetected'
  | 'scheduleTimezoneOptions'
  | 'scheduleDateError'
  | 'scheduleTimezoneError'
  | 'scheduleGithubUsernameError'
  | 'schedulePreviewWindows'
  | 'scheduleCanContinue'
  | 'onScheduleDateChange'
  | 'onScheduleTimezoneChange'
  | 'onScheduleGithubUsernameChange'
  | 'onIncludeWeekendsChange'
  | 'onScheduleContinue'
  | 'onDashboard'
>;

export function SchedulingFormStep({
  scheduleDate,
  scheduleTimezone,
  scheduleGithubUsername,
  scheduleIncludeWeekends,
  scheduleTimezoneDetected,
  scheduleTimezoneOptions,
  scheduleDateError,
  scheduleTimezoneError,
  scheduleGithubUsernameError,
  schedulePreviewWindows,
  scheduleCanContinue,
  onScheduleDateChange,
  onScheduleTimezoneChange,
  onScheduleGithubUsernameChange,
  onIncludeWeekendsChange,
  onScheduleContinue,
  onDashboard,
}: SchedulingFormStepProps) {
  const timezone = scheduleTimezone.trim();
  const firstWindow = schedulePreviewWindows[0] ?? null;
  const dateErrorId = scheduleDateError ? 'schedule-date-error' : undefined;
  const timezoneErrorId = scheduleTimezoneError
    ? 'schedule-timezone-error'
    : undefined;
  const githubErrorId = scheduleGithubUsernameError
    ? 'schedule-github-error'
    : undefined;

  const { minYmd, maxYmd } = useMemo(() => {
    if (!isValidIanaTimezone(timezone)) {
      return { minYmd: undefined, maxYmd: undefined };
    }
    const todayYmd = localTodayYmdInTimezone(timezone);
    return {
      minYmd: todayYmd,
      maxYmd: plusCalendarDaysYmd(todayYmd, 14),
    };
  }, [timezone]);

  const weekendToggleId = 'schedule-include-weekends';

  return (
    <div className="space-y-4 rounded-md border border-gray-200 p-4">
      <div>
        <label
          className="block text-sm font-medium text-gray-800"
          htmlFor="schedule-start-date"
        >
          Day 1 start date
        </label>
        <Input
          id="schedule-start-date"
          type="date"
          value={scheduleDate}
          min={minYmd}
          max={maxYmd}
          onChange={(event) => onScheduleDateChange(event.target.value)}
          aria-label="Day 1 start date"
          aria-invalid={Boolean(scheduleDateError)}
          aria-describedby={dateErrorId}
          className={
            scheduleDate && scheduleCanContinue
              ? 'border-wheat-400 bg-wheat-50/40'
              : undefined
          }
        />
        <p className="mt-1 text-xs text-gray-500">
          Choose any date through your 14-day window. Weekend starts require the
          toggle below.
        </p>
      </div>
      {scheduleDateError ? (
        <p id="schedule-date-error" className="text-sm text-red-700">
          {scheduleDateError}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          id={weekendToggleId}
          type="checkbox"
          checked={scheduleIncludeWeekends}
          onChange={(event) => onIncludeWeekendsChange(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-wheat-700 focus:ring-wheat-500"
        />
        <label htmlFor={weekendToggleId} className="text-sm text-gray-800">
          Show weekends (Sat–Sun) as selectable start days
        </label>
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-800"
          htmlFor="schedule-timezone"
        >
          Timezone
        </label>
        <Input
          id="schedule-timezone"
          type="text"
          value={scheduleTimezone}
          list="candidate-timezone-list"
          onChange={(event) => onScheduleTimezoneChange(event.target.value)}
          placeholder="America/New_York"
          aria-label="Timezone"
          aria-invalid={Boolean(scheduleTimezoneError)}
          aria-describedby={timezoneErrorId}
        />
      </div>
      <datalist id="candidate-timezone-list">
        {scheduleTimezoneOptions.map((timezoneOption) => (
          <option key={timezoneOption} value={timezoneOption} />
        ))}
      </datalist>
      {scheduleTimezoneDetected ? (
        <p className="text-xs text-gray-500">
          Detected timezone: {scheduleTimezoneDetected}
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          We could not detect your timezone. UTC is selected as a safe fallback;
          change it if needed.
        </p>
      )}
      {scheduleTimezoneError ? (
        <p id="schedule-timezone-error" className="text-sm text-red-700">
          {scheduleTimezoneError}
        </p>
      ) : null}

      <div>
        <label
          className="block text-sm font-medium text-gray-800"
          htmlFor="schedule-github-username"
        >
          GitHub username
        </label>
        <Input
          id="schedule-github-username"
          type="text"
          value={scheduleGithubUsername}
          onChange={(event) =>
            onScheduleGithubUsernameChange(event.target.value)
          }
          placeholder="octocat"
          aria-label="GitHub username"
          aria-invalid={Boolean(scheduleGithubUsernameError)}
          aria-describedby={githubErrorId}
        />
      </div>
      <p className="text-xs text-gray-500">
        Use the GitHub username connected to your Trial workspace.
      </p>
      {scheduleGithubUsernameError ? (
        <p id="schedule-github-error" className="text-sm text-red-700">
          {scheduleGithubUsernameError}
        </p>
      ) : null}

      {firstWindow && timezone ? (
        <div className="rounded-md border border-wheat-100 bg-wheat-50 p-3 text-sm text-wheat-900">
          Day 1 will unlock on{' '}
          <span className="font-semibold">
            {formatScheduleDate(firstWindow.windowStartAt, timezone)}
          </span>{' '}
          at{' '}
          <span className="font-semibold">
            {formatScheduleTime(firstWindow.windowStartAt, timezone)} (
            {timezone})
          </span>
          .
        </div>
      ) : null}

      {schedulePreviewWindows.length > 0 && timezone ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Five-day window preview
          </h2>
          <ul className="mt-2 space-y-2">
            {schedulePreviewWindows.map((window) => (
              <li
                key={window.dayIndex}
                className="rounded-md border border-gray-200 p-3 text-sm"
              >
                <div className="font-medium">
                  Day {window.dayIndex} —{' '}
                  {SCHEDULE_DAY_LABELS[window.dayIndex] ?? 'Trial work'}
                </div>
                <div className="text-gray-700">
                  {formatScheduleDate(window.windowStartAt, timezone)}
                </div>
                <div className="text-gray-600">
                  {formatScheduleTimeRange(
                    window.windowStartAt,
                    window.windowEndAt,
                    timezone,
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onDashboard}>
          Back to portal
        </Button>
        <Button disabled={!scheduleCanContinue} onClick={onScheduleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
