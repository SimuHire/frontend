import { RunningIntroSection } from './components/RunningIntroSection';
import { RunningPanelsSection } from './components/RunningPanelsSection';
import { SessionWindowBanner } from '../components/SessionWindowBanner';
import type { RunningViewProps } from './RunningView.types';

export type { RunningViewProps } from './RunningView.types';

export function RunningView({
  title,
  role,
  completedCount,
  currentDayIndex,
  started,
  currentTask,
  candidateSessionId,
  taskError,
  taskLoading,
  resourceLink,
  submitting,
  showWorkspacePanel,
  showRecordingPanel,
  showDocsPanel,
  windowState,
  actionGate,
  codingWorkspace,
  lastDraftSavedAt,
  lastSubmissionAt,
  lastSubmissionId,
  onRetryTask,
  onSubmit,
  onStartTests,
  onPollTests,
  onDashboard,
  onTaskWindowClosed,
  onCodingWorkspaceSnapshot,
}: RunningViewProps) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4 w-full">
      <SessionWindowBanner
        windowState={windowState}
        started={started}
        lastDraftSavedAt={lastDraftSavedAt}
        lastSubmissionAt={lastSubmissionAt}
        lastSubmissionId={lastSubmissionId}
      />
      <RunningIntroSection
        title={title}
        role={role}
        taskLoading={taskLoading}
        completedCount={completedCount}
        currentDayIndex={currentDayIndex}
        currentTaskTitle={currentTask?.title ?? null}
        taskError={taskError}
        onRetryTask={onRetryTask}
      />

      <RunningPanelsSection
        currentTask={currentTask}
        candidateSessionId={candidateSessionId}
        resourceLink={resourceLink}
        trialRole={role}
        submitting={submitting}
        showWorkspacePanel={showWorkspacePanel}
        showRecordingPanel={showRecordingPanel}
        showDocsPanel={showDocsPanel}
        actionGate={actionGate}
        codingWorkspace={codingWorkspace}
        taskError={taskError}
        onSubmit={onSubmit}
        onRetryTask={onRetryTask}
        onStartTests={onStartTests}
        onPollTests={onPollTests}
        onDashboard={onDashboard}
        onTaskWindowClosed={onTaskWindowClosed}
        onCodingWorkspaceSnapshot={onCodingWorkspaceSnapshot}
      />
    </div>
  );
}
