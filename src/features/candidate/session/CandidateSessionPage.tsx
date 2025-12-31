'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAccessToken as fetchAccessToken,
  useUser,
} from '@auth0/nextjs-auth0/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CandidateTaskView from '@/features/candidate/session/task/CandidateTaskView';
import CandidateTaskProgress from '@/features/candidate/session/task/CandidateTaskProgress';
import type { CandidateSessionBootstrapResponse } from '@/lib/api/candidate';
import { verifyCandidateSessionEmail } from '@/lib/api/candidate';
import { getUserEmail } from '@/lib/auth0-claims';
import { useCandidateSession } from './CandidateSessionProvider';
import { useCandidateBootstrap } from './hooks/useCandidateBootstrap';
import { useCurrentTask } from './hooks/useCurrentTask';
import { useTaskSubmission } from './hooks/useTaskSubmission';
import { deriveCurrentDayIndex } from './utils/taskTransforms';
import { StateMessage } from './components/StateMessage';
import { friendlyVerifyError } from './utils/errorMessages';

type ViewState =
  | 'loading'
  | 'verify'
  | 'intro'
  | 'error'
  | 'starting'
  | 'running';

export default function CandidateSessionPage({ token }: { token: string }) {
  const {
    state,
    setInviteToken,
    setToken,
    setVerifiedEmail,
    setCandidateSessionId,
    setBootstrap,
    setStarted,
    setTaskLoading,
    setTaskLoaded,
    setTaskError,
    clearTaskError,
    reset,
  } = useCandidateSession();
  const router = useRouter();
  const { user } = useUser();

  const bootstrap = state.bootstrap as CandidateSessionBootstrapResponse | null;
  const title = useMemo(() => bootstrap?.simulation?.title ?? '', [bootstrap]);
  const role = useMemo(() => bootstrap?.simulation?.role ?? '', [bootstrap]);
  const candidateSessionId =
    state.candidateSessionId ?? bootstrap?.candidateSessionId ?? null;

  const profileEmail = useMemo(
    () => getUserEmail(user as Record<string, unknown> | null),
    [user],
  );
  const [email, setEmail] = useState(state.verifiedEmail ?? profileEmail ?? '');
  const [hasEditedEmail, setHasEditedEmail] = useState(false);
  const [verifyState, setVerifyState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchAccessToken()
      .then((accessToken) => {
        if (cancelled) return;
        setToken(accessToken);
        setAuthError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthError(
          'Unable to load your login session. Please sign in again.',
        );
      })
      .finally(() => {
        if (cancelled) return;
        setAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setToken]);

  const {
    state: bootstrapState,
    errorMessage: bootstrapError,
    errorStatus: bootstrapStatus,
    load: loadBootstrap,
  } = useCandidateBootstrap({
    inviteToken: token,
    authToken: state.token,
    onResolved: setBootstrap,
    onSetInviteToken: setInviteToken,
  });

  const { fetchCurrentTask } = useCurrentTask({
    token: state.token,
    candidateSessionId,
    setTaskLoading,
    setTaskLoaded,
    setTaskError,
    clearTaskError,
  });

  const { submitting, handleSubmit } = useTaskSubmission({
    token: state.token,
    candidateSessionId,
    currentTask: state.taskState.currentTask,
    clearTaskError,
    setTaskError,
    refreshTask: fetchCurrentTask,
  });

  useEffect(() => {
    if (state.inviteToken && state.inviteToken !== token) {
      reset();
    }
    setInviteToken(token);
  }, [reset, setInviteToken, state.inviteToken, token]);

  useEffect(() => {
    if (authLoading) return;
    if (!state.token) return;
    if (state.inviteToken === token && state.bootstrap) return;
    void loadBootstrap();
  }, [
    authLoading,
    loadBootstrap,
    state.bootstrap,
    state.inviteToken,
    state.token,
    token,
  ]);

  useEffect(() => {
    if (!state.started) return;
    if (!state.bootstrap) return;
    void fetchCurrentTask();
  }, [fetchCurrentTask, state.bootstrap, state.started]);

  useEffect(() => {
    if (bootstrap?.candidateSessionId) {
      setCandidateSessionId(bootstrap.candidateSessionId);
    }
  }, [bootstrap?.candidateSessionId, setCandidateSessionId]);

  const completedCount = state.taskState.completedTaskIds.length;
  const currentDayIndex = useMemo(
    () =>
      deriveCurrentDayIndex(
        completedCount,
        state.taskState.currentTask,
        state.taskState.isComplete,
      ),
    [completedCount, state.taskState.currentTask, state.taskState.isComplete],
  );

  const hasVerifiedAccess = useMemo(
    () =>
      Boolean(candidateSessionId) &&
      Boolean(state.verifiedEmail) &&
      state.inviteToken === token,
    [candidateSessionId, state.inviteToken, state.verifiedEmail, token],
  );

  const view: ViewState = useMemo(() => {
    if (authLoading) return 'loading';
    if (authError) return 'error';
    if (bootstrapState === 'loading') return 'loading';
    if (bootstrapState === 'error') {
      if (bootstrapStatus === 401) return 'verify';
      return 'error';
    }
    if (!hasVerifiedAccess) return 'verify';
    if (!state.started) return 'intro';
    if (!state.bootstrap) return 'starting';
    if (state.taskState.loading) return 'starting';
    return 'running';
  }, [
    authError,
    authLoading,
    bootstrapState,
    bootstrapStatus,
    hasVerifiedAccess,
    state.bootstrap,
    state.started,
    state.taskState.loading,
  ]);

  const errorMessage = authError ?? bootstrapError;

  const handleVerify = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (verifyState === 'loading') return;
      if (hasVerifiedAccess) return;
      const safeEmail = (
        email || (!hasEditedEmail ? (profileEmail ?? '') : '')
      ).trim();

      if (!safeEmail) {
        setVerifyError('Email is required to continue.');
        return;
      }

      if (!token) {
        setVerifyError('Missing invite token.');
        return;
      }

      if (!state.token) {
        setVerifyError('Missing login session. Please sign in again.');
        return;
      }

      setVerifyState('loading');
      setVerifyError(null);

      try {
        const resp = await verifyCandidateSessionEmail(
          token,
          safeEmail,
          state.token,
        );
        setCandidateSessionId(resp.candidateSessionId);
        setVerifiedEmail(safeEmail);
        setEmail(safeEmail);
        if (!state.bootstrap) {
          setBootstrap({
            candidateSessionId: resp.candidateSessionId,
            status: resp.status,
            simulation: resp.simulation,
          });
        }
        setVerifyState('success');
        router.push('/candidate/dashboard');
      } catch (err) {
        setVerifyError(friendlyVerifyError(err));
        setVerifyState('error');
      }
    },
    [
      email,
      hasEditedEmail,
      hasVerifiedAccess,
      profileEmail,
      router,
      setBootstrap,
      setCandidateSessionId,
      setVerifiedEmail,
      state.bootstrap,
      state.token,
      token,
      verifyState,
    ],
  );

  if (view === 'loading') {
    return (
      <StateMessage
        title="Loading simulation…"
        description="Validating invite link."
      />
    );
  }

  if (view === 'error') {
    return (
      <StateMessage
        title="Unable to load simulation"
        description={errorMessage}
        action={<Button onClick={loadBootstrap}>Retry</Button>}
      />
    );
  }

  if (view === 'verify') {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <div>
          <div className="text-xl font-bold">
            {title || 'Verify your invite'}
          </div>
          <div className="text-sm text-gray-600">Role: {role || 'Pending'}</div>
        </div>

        <p className="text-sm text-gray-700">
          Enter the email address that received this invite to unlock your
          tasks.
        </p>

        <form
          className="space-y-3"
          onSubmit={(event) => void handleVerify(event)}
        >
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="candidate-email"
          >
            Email address
          </label>
          <Input
            id="candidate-email"
            name="candidate-email"
            type="email"
            autoComplete="email"
            value={
              hasEditedEmail
                ? email
                : email || state.verifiedEmail || profileEmail || ''
            }
            onChange={(e) => {
              setHasEditedEmail(true);
              setEmail(e.target.value);
            }}
            placeholder="you@example.com"
            required
          />
          {verifyError ? (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {verifyError}
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button type="submit" loading={verifyState === 'loading'}>
              {verifyState === 'success' ? 'Verified' : 'Continue'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={verifyState === 'loading'}
              onClick={() => void loadBootstrap()}
            >
              Reload link
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'intro') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-2xl font-bold">{title}</div>
        <div className="text-sm text-gray-600 mt-1">Role: {role}</div>

        <div className="mt-6 space-y-2 text-sm text-gray-700">
          <p>You’re about to start a 5-day asynchronous work simulation.</p>
          <p>
            You’ll complete one task per day (design → code → debug → handoff →
            documentation).
          </p>
          <p>When you’re ready, click Start.</p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              setStarted(true);
            }}
          >
            Start simulation
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'starting') {
    return (
      <StateMessage
        title="Starting…"
        description="Loading your current task."
      />
    );
  }

  if (state.taskState.isComplete) {
    return (
      <StateMessage
        title="Simulation complete 🎉"
        description="You’ve submitted all 5 days. You can close this tab now."
      />
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xl font-bold">{title}</div>
          <div className="text-sm text-gray-600">Role: {role}</div>
        </div>
        {state.taskState.loading ? (
          <div className="text-sm text-gray-500">Refreshing…</div>
        ) : null}
      </div>

      <CandidateTaskProgress
        completedCount={completedCount}
        currentDayIndex={currentDayIndex}
      />

      {state.taskState.error ? (
        <div className="border rounded-md p-3 bg-red-50 text-sm text-red-800">
          {state.taskState.error}{' '}
          <button
            className="underline ml-2"
            onClick={() => void fetchCurrentTask()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {state.taskState.currentTask && candidateSessionId !== null ? (
        <CandidateTaskView
          task={state.taskState.currentTask}
          candidateSessionId={candidateSessionId}
          submitting={submitting}
          submitError={state.taskState.error}
          onSubmit={handleSubmit}
        />
      ) : state.taskState.currentTask ? (
        <div className="border rounded-md p-4 text-sm text-gray-700">
          Session not ready. Please refresh.
        </div>
      ) : (
        <div className="border rounded-md p-4 text-sm text-gray-700">
          No current task available.
        </div>
      )}
    </div>
  );
}
