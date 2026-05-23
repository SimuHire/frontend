'use client';

import { TaskContainer } from './components/TaskContainer';
import { TaskHeader } from './components/TaskHeader';
import { TaskDescription } from './components/TaskDescription';
import { TaskStatus } from './components/TaskStatus';
import { TaskPanelErrorBanner } from './components/TaskPanelErrorBanner';
import { TaskActions } from './components/TaskActions';
import { TaskDraftStatusSlots } from './components/TaskDraftStatusSlots';
import { TaskWorkArea } from './components/TaskWorkArea';
import { useTaskSubmitController } from './hooks/useTaskSubmitController';
import { withDay3ImplementationWrapUpCopy } from './utils/day3ImplementationWrapUpUtils';
import {
  DEFAULT_ACTION_GATE,
  type CandidateTaskViewProps,
} from './CandidateTaskView.types';

export function CandidateTaskViewInner({
  candidateSessionId,
  task,
  trialRole = '',
  onSubmit,
  submitting,
  submitError,
  actionGate,
  onTaskWindowClosed,
}: CandidateTaskViewProps) {
  const displayTask = withDay3ImplementationWrapUpCopy(task);
  const controller = useTaskSubmitController({
    candidateSessionId,
    task,
    onSubmit,
    submitting,
    submitError,
    onTaskWindowClosed,
    actionGate: actionGate ?? DEFAULT_ACTION_GATE,
  });
  const isDay1DesignDoc = controller.textTask && task.dayIndex === 1;
  const showDay5DraftStatus = controller.textTask && task.dayIndex === 5;
  const comeBackAt = (actionGate ?? DEFAULT_ACTION_GATE).comeBackAt;
  const hideDay1Actions = isDay1DesignDoc && controller.readOnly && !comeBackAt;
  const draftStatus = TaskDraftStatusSlots({
    showDay1DraftStatus: false,
    showDay5DraftStatus,
    draftAutosaveStatus: controller.draftAutosaveStatus,
    savedAt: controller.savedAt,
    draftRestoreApplied: controller.draftRestoreApplied,
    draftError: controller.draftError,
  });

  return (
    <TaskContainer
      className={
        isDay1DesignDoc
          ? 'mx-auto w-full min-w-0 max-w-[min(100%,76rem)] overflow-x-hidden'
          : undefined
      }
    >
      {isDay1DesignDoc ? null : (
        <TaskHeader
          task={displayTask}
          statusSlot={draftStatus.headerStatusSlot}
        />
      )}
      {isDay1DesignDoc ? null : (
        <TaskDescription description={displayTask.description} />
      )}
      <TaskWorkArea
        dayIndex={task.dayIndex}
        trialRole={trialRole}
        candidateSessionId={candidateSessionId}
        projectBrief={displayTask.description}
        cutoffAt={task.cutoffAt}
        githubNative={controller.githubNative}
        readOnly={controller.readOnly}
        disabledReason={controller.disabledReason}
        draftError={controller.draftError}
        draftPersistentFailure={controller.draftPersistentFailure}
        draftAutosaveStatus={controller.draftAutosaveStatus}
        draftRestoreApplied={controller.draftRestoreApplied}
        text={controller.text}
        disabled={controller.disabled}
        savedAt={controller.savedAt}
        onChangeText={controller.setText}
        onFlushDraft={controller.saveDraftNow}
        onSaveDraft={controller.saveDraftNow}
        onSubmit={controller.saveAndSubmit}
        submitDisabled={controller.disabled}
        submitLabel="Submit & continue to Day 2"
        actionStatus={controller.actionStatus}
      />
      {draftStatus.stickyDraftStatus}
      <TaskStatus
        displayStatus={controller.displayStatus}
        progress={controller.lastProgress}
        submittedLabel={controller.submittedLabel}
        submittedShaLabel={controller.submittedShaLabel}
        submittedSha={controller.submittedSha}
      />
      <TaskPanelErrorBanner message={controller.errorToShow} />
      {hideDay1Actions || isDay1DesignDoc ? null : (
        <TaskActions
          isTextTask={controller.textTask}
          displayStatus={controller.actionStatus}
          disabled={controller.disabled}
          disabledReason={controller.disabledReason}
          onSaveDraft={
            controller.textTask ? controller.saveDraftNow : undefined
          }
          onSubmit={controller.saveAndSubmit}
          requireSubmitConfirmation={false}
        />
      )}
    </TaskContainer>
  );
}
