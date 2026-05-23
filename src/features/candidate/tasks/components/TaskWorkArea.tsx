'use client';

import { TaskTextInput } from './TaskTextInput';
import { Day1DesignDocWorkspace } from './Day1DesignDocWorkspace';
import type { TaskDraftAutosaveStatus } from '../hooks/useTaskDraftAutosave';

type TaskWorkAreaProps = {
  dayIndex: number;
  trialRole?: string;
  candidateSessionId: number | null;
  candidateName?: string | null;
  projectBrief: string;
  cutoffAt?: string | null;
  githubNative: boolean;
  readOnly: boolean;
  disabledReason: string | null;
  draftError: string | null;
  draftPersistentFailure?: boolean;
  draftAutosaveStatus?: TaskDraftAutosaveStatus;
  draftRestoreApplied?: boolean;
  text: string;
  disabled: boolean;
  savedAt: number | null;
  onChangeText: (value: string) => void;
  onFlushDraft?: () => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void | Promise<unknown>;
  submitDisabled?: boolean;
  submitLabel?: string;
  actionStatus?: 'idle' | 'submitting' | 'submitted';
};

export function TaskWorkArea({
  dayIndex,
  trialRole = '',
  candidateSessionId,
  candidateName,
  projectBrief,
  cutoffAt,
  githubNative,
  readOnly,
  disabledReason,
  draftError,
  draftPersistentFailure,
  draftAutosaveStatus = 'disabled',
  draftRestoreApplied = false,
  text,
  disabled,
  savedAt,
  onChangeText,
  onFlushDraft,
  onSaveDraft,
  onSubmit,
  submitDisabled = true,
  submitLabel = 'Submit & continue to Day 2',
  actionStatus = 'idle',
}: TaskWorkAreaProps) {
  if (!githubNative && dayIndex === 1) {
    return (
      <Day1DesignDocWorkspace
        role={trialRole || 'Your role'}
        candidateName={candidateName}
        projectBrief={projectBrief}
        value={text}
        disabled={disabled}
        readOnly={readOnly}
        readOnlyReason={disabledReason}
        draftError={draftError}
        draftPersistentFailure={draftPersistentFailure}
        draftAutosaveStatus={draftAutosaveStatus}
        savedAt={savedAt}
        draftRestoreApplied={draftRestoreApplied}
        cutoffAt={cutoffAt}
        editorKey={`${candidateSessionId ?? 'na'}-day1`}
        onChange={onChangeText}
        onFlushDraft={onFlushDraft}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit ?? (() => undefined)}
        submitDisabled={submitDisabled}
        submitLabel={submitLabel}
        actionStatus={actionStatus}
      />
    );
  }

  return (
    <div className="mt-6">
      {githubNative ? (
        readOnly ? (
          <div className="rounded-md border border-gray-300 bg-gray-100 p-3 text-sm text-gray-900">
            {disabledReason ??
              'This day is closed and read-only. Review your prompt and recorded submission details in the banner above.'}
          </div>
        ) : (
          <div className="rounded-md border border-wheat-100 bg-wheat-50 p-3 text-sm text-wheat-900">
            {dayIndex === 3
              ? 'Use the same Codespace and repository from Day 2 for all wrap-up work. When the implementation is ready for handoff, submit to record the final commit SHA.'
              : 'Use your Codespace for all implementation work. When you’re ready, submit to move to the next day.'}
          </div>
        )
      ) : (
        <TaskTextInput
          value={text}
          onChange={onChangeText}
          disabled={disabled}
          readOnly={readOnly}
          readOnlyReason={disabledReason}
          savedAt={savedAt}
        />
      )}
    </div>
  );
}
