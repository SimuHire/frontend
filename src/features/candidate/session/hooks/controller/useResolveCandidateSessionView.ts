import {
  hasScheduleConfigured,
  isScheduleLocked,
} from '../../utils/scheduleUtils';
import type { CandidateBootstrap } from '../../state/types';
import type { ViewState } from '../../views/types';

type Params = {
  view: ViewState;
  hasTaskData: boolean;
  started: boolean;
  bootstrap: CandidateBootstrap | null;
  scheduleResponseWindowCount: number;
  clockNowMs: number;
};

export function resolveCandidateSessionView({
  view,
  hasTaskData,
  bootstrap,
  scheduleResponseWindowCount,
  clockNowMs,
}: Params): ViewState {
  const canUsePersistedTaskData = hasTaskData && bootstrap !== null;
  const resolvedView: ViewState =
    (view === 'loading' || view === 'starting') && canUsePersistedTaskData
      ? 'running'
      : view;

  const hasSchedule =
    hasScheduleConfigured(bootstrap) ||
    (bootstrap?.scheduledStartAt != null &&
      bootstrap?.candidateTimezone != null &&
      scheduleResponseWindowCount > 0);

  const lockEligibleViews: ViewState[] = [
    'loading',
    'starting',
    'running',
    'scheduling',
    'scheduleConfirm',
    'scheduleSubmitting',
  ];

  const scheduleLocked =
    hasSchedule &&
    isScheduleLocked(
      {
        scheduledStartAt: bootstrap?.scheduledStartAt,
        candidateTimezone: bootstrap?.candidateTimezone,
        dayWindows: bootstrap?.dayWindows,
        currentDayWindow: bootstrap?.currentDayWindow ?? null,
      },
      clockNowMs,
    );

  if (scheduleLocked && lockEligibleViews.includes(resolvedView)) {
    return 'locked';
  }

  if (resolvedView === 'locked' && hasTaskData) {
    return 'running';
  }

  return resolvedView;
}
