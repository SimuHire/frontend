'use client';

import { useState } from 'react';
import { useOptionalCandidateSession } from '../state/context';
import { RunTestsPanel } from '@/features/candidate/tasks/components/RunTestsPanel';
import { WorkspacePanel } from '@/features/candidate/tasks/components/WorkspacePanel';
import { GithubUsernamePromptModal } from '@/features/candidate/tasks/components/GithubUsernamePromptModal';
import type { CandidateTask } from '../CandidateSessionProvider';
import type { PollResult } from '@/features/candidate/tasks/hooks/useRunTestsTypes';
import type { WindowActionGate } from '../lib/windowState';
import type {
  CodingWorkspace,
  CodingWorkspaceSnapshot,
} from '@/features/candidate/tasks/utils/codingWorkspaceUtils';
import { isPastTaskCutoff } from '@/features/candidate/tasks/utils/taskCutoffUtils';

export type WorkspaceAndTestsProps = {
  task: CandidateTask;
  candidateSessionId: number;
  actionGate: WindowActionGate;
  codingWorkspace?: CodingWorkspace | null;
  onStartTests: () => Promise<{ runId: string }>;
  onPollTests: (runId: string) => Promise<PollResult>;
  onTaskWindowClosed: (err: unknown) => void;
  onCodingWorkspaceSnapshot?: (snapshot: CodingWorkspaceSnapshot) => void;
};

export function WorkspaceAndTests({
  task,
  candidateSessionId,
  actionGate,
  codingWorkspace,
  onStartTests,
  onPollTests,
  onTaskWindowClosed,
  onCodingWorkspaceSnapshot,
}: WorkspaceAndTestsProps) {
  const session = useOptionalCandidateSession();
  const sessionGithubUsername =
    session?.state.bootstrap?.githubUsername ?? null;
  const [githubUsername, setGithubUsername] = useState<string | null>(
    sessionGithubUsername,
  );
  const closedByCutoff = isPastTaskCutoff(task.cutoffAt);
  const workspaceReadOnly = actionGate.isReadOnly || closedByCutoff;
  const cutoffDisabledReason = closedByCutoff
    ? 'Day closed. The Codespace is read-only after cutoff.'
    : null;
  const disabledReason = actionGate.disabledReason ?? cutoffDisabledReason;
  const requireGithubUsername =
    (task.dayIndex === 2 || task.dayIndex === 3) &&
    !sessionGithubUsername &&
    !githubUsername;

  return (
    <>
      <GithubUsernamePromptModal
        open={requireGithubUsername}
        candidateSessionId={candidateSessionId}
        taskId={task.id}
        onSaved={(savedUsername) => setGithubUsername(savedUsername)}
      />
      {requireGithubUsername ? (
        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
          Connect your GitHub username to unlock the Day 2 and Day 3 Codespace.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <WorkspacePanel
            taskId={task.id}
            candidateSessionId={candidateSessionId}
            dayIndex={task.dayIndex}
            githubUsername={githubUsername}
            readOnly={workspaceReadOnly}
            readOnlyReason={disabledReason}
            codingWorkspace={codingWorkspace}
            cutoffCommitSha={task.cutoffCommitSha ?? null}
            cutoffAt={task.cutoffAt ?? null}
            isClosed={closedByCutoff}
            onTaskWindowClosed={onTaskWindowClosed}
            onCodingWorkspaceSnapshot={onCodingWorkspaceSnapshot}
          />
          <RunTestsPanel
            onStart={onStartTests}
            onPoll={onPollTests}
            storageKey={`winoe:taskRun:${task.id}`}
            disabled={workspaceReadOnly}
            disabledReason={disabledReason}
          />
        </div>
      )}
    </>
  );
}
