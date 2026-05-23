import { useMemo } from 'react';
import { useOptionalCandidateSession } from '../state/context';
import { AiNoticeCard } from '../components/AiNoticeCard';
import { SchedulingConfirmStep } from './SchedulingConfirmStep';
import { SchedulingFormStep } from './SchedulingFormStep';
import { SchedulingSubmitErrorBanner } from './SchedulingSubmitErrorBanner';
import type { SchedulingViewProps } from './SchedulingView.types';

export function SchedulingView({
  title,
  role,
  step,
  scheduleSubmitError,
  onScheduleRetry,
  ...rest
}: SchedulingViewProps) {
  const bootstrap = useOptionalCandidateSession()?.state.bootstrap ?? null;
  const showAiNotice = useMemo(
    () =>
      bootstrap
        ? Object.values(bootstrap.evalEnabledByDay ?? {}).some(Boolean)
        : true,
    [bootstrap],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Schedule your Trial start
        </h1>
        <p className="mt-1 text-sm font-medium text-gray-800">
          {role}
          {title ? ` · ${title}` : ''}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Pick Day 1 on your calendar.{' '}
          <span className="text-gray-800">
            Your Trial unlocks at 9 AM your local time. Days 1–4 close at 5 PM.
            Day 5 closes at 9 PM as a kindness — reflection deserves space.
          </span>
        </p>
      </div>

      {showAiNotice ? (
        <AiNoticeCard
          compact
          version={bootstrap?.aiNoticeVersion}
          noticeText={bootstrap?.aiNoticeText}
        />
      ) : null}
      <SchedulingSubmitErrorBanner
        scheduleSubmitError={scheduleSubmitError}
        onScheduleRetry={onScheduleRetry}
      />
      {step === 'form' ? (
        <SchedulingFormStep
          scheduleDate={rest.scheduleDate}
          scheduleTimezone={rest.scheduleTimezone}
          scheduleGithubUsername={rest.scheduleGithubUsername}
          scheduleIncludeWeekends={rest.scheduleIncludeWeekends}
          scheduleTimezoneDetected={rest.scheduleTimezoneDetected}
          scheduleTimezoneOptions={rest.scheduleTimezoneOptions}
          scheduleDateError={rest.scheduleDateError}
          scheduleTimezoneError={rest.scheduleTimezoneError}
          scheduleGithubUsernameError={rest.scheduleGithubUsernameError}
          schedulePreviewWindows={rest.schedulePreviewWindows}
          scheduleCanContinue={rest.scheduleCanContinue}
          onScheduleDateChange={rest.onScheduleDateChange}
          onScheduleTimezoneChange={rest.onScheduleTimezoneChange}
          onScheduleGithubUsernameChange={rest.onScheduleGithubUsernameChange}
          onIncludeWeekendsChange={rest.onIncludeWeekendsChange}
          onScheduleContinue={rest.onScheduleContinue}
          onDashboard={rest.onDashboard}
        />
      ) : (
        <SchedulingConfirmStep
          step={step}
          scheduleTimezone={rest.scheduleTimezone}
          scheduleGithubUsername={rest.scheduleGithubUsername}
          schedulePreviewWindows={rest.schedulePreviewWindows}
          onScheduleBack={rest.onScheduleBack}
          onScheduleConfirm={rest.onScheduleConfirm}
        />
      )}
    </div>
  );
}
