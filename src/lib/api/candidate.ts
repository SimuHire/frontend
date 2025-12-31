import { apiClient, type ApiClientOptions } from './httpClient';
import {
  HttpError,
  extractBackendMessage,
  fallbackStatus,
  toHttpError,
} from './utils/errors';

export { HttpError };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
const baseClientOptions: ApiClientOptions = {
  basePath: API_BASE || '/api',
  skipAuth: false,
};

type SimulationSummary = { title: string; role: string };

export type CandidateSessionBootstrapResponse = {
  candidateSessionId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  simulation: SimulationSummary;
};

export type CandidateEmailVerificationResponse = {
  candidateSessionId: number;
  status: CandidateSessionBootstrapResponse['status'];
  simulation: SimulationSummary;
};

type TaskType =
  | 'design'
  | 'code'
  | 'debug'
  | 'handoff'
  | 'documentation'
  | string;

export type CandidateTask = {
  id: number;
  dayIndex: number;
  type: TaskType;
  title: string;
  description: string;
};

export type CandidateCurrentTaskResponse = {
  isComplete: boolean;
  completedTaskIds?: number[];
  progress?: { completedTaskIds?: number[] };
  currentTask: CandidateTask | null;
};

export type CandidateTaskSubmitResponse = {
  submissionId: number;
  taskId: number;
  candidateSessionId: number;
  submittedAt: string;
  progress: {
    completed: number;
    total: number;
  };
  isComplete: boolean;
};

function toClientOptions(authToken: string): ApiClientOptions {
  return { ...baseClientOptions, authToken };
}

function ensureAuthToken(authToken: string | null | undefined) {
  if (!authToken || !authToken.trim()) {
    throw new HttpError(401, 'Not authenticated. Please sign in again.');
  }
}

export async function resolveCandidateInviteToken(
  token: string,
  authToken: string,
) {
  ensureAuthToken(authToken);
  const path = `/candidate/session/${encodeURIComponent(token)}`;

  try {
    return await apiClient.get<CandidateSessionBootstrapResponse>(
      path,
      { cache: 'no-store' },
      toClientOptions(authToken),
    );
  } catch (err: unknown) {
    if (err && typeof err === 'object') {
      const status = (err as { status?: unknown }).status;
      if (status === 404)
        throw new HttpError(404, 'That invite link is invalid.');
      if (status === 410)
        throw new HttpError(410, 'That invite link has expired.');

      const backendMsg = extractBackendMessage(
        (err as { details?: unknown }).details,
        false,
      );

      const safeStatus =
        typeof status === 'number' ? status : fallbackStatus(err, 500);

      throw new HttpError(
        safeStatus,
        backendMsg?.trim() || 'Something went wrong loading your simulation.',
      );
    }

    throw toHttpError(err, {
      status: 500,
      message: 'Something went wrong loading your simulation.',
    });
  }
}

export async function verifyCandidateSessionEmail(
  inviteToken: string,
  email: string,
  authToken: string,
): Promise<CandidateEmailVerificationResponse> {
  const safeInviteToken = inviteToken.trim();
  const path = `/candidate/session/${encodeURIComponent(safeInviteToken)}/verify`;
  const safeEmail = email.trim();

  ensureAuthToken(authToken);

  if (!safeInviteToken) {
    throw new HttpError(400, 'Missing invite token.');
  }

  if (!safeEmail) {
    throw new HttpError(400, 'Email is required to verify your invite.');
  }

  try {
    const data = await apiClient.post<CandidateEmailVerificationResponse>(
      path,
      { email: safeEmail },
      { cache: 'no-store' },
      toClientOptions(authToken),
    );
    const candidateSessionId = Number(
      (data as { candidateSessionId?: unknown }).candidateSessionId ??
        (data as { candidate_session_id?: unknown }).candidate_session_id,
    );

    if (!Number.isFinite(candidateSessionId)) {
      throw new HttpError(
        500,
        'Unable to verify your email right now. Please try again.',
      );
    }

    const status = ((
      data as { status?: CandidateSessionBootstrapResponse['status'] }
    ).status ?? 'in_progress') as CandidateSessionBootstrapResponse['status'];

    const simulation =
      (data as { simulation?: SimulationSummary }).simulation ??
      ({ title: '', role: '' } as SimulationSummary);

    return { candidateSessionId, status, simulation };
  } catch (err: unknown) {
    if (err && typeof err === 'object') {
      const status = (err as { status?: unknown }).status;
      const backendMsg = extractBackendMessage(
        (err as { details?: unknown }).details,
        false,
      );

      if (status === 404)
        throw new HttpError(404, 'That invite link is invalid.');
      if (status === 410)
        throw new HttpError(410, 'That invite link has expired.');
      if (status === 401 || status === 403)
        throw new HttpError(
          typeof status === 'number' ? status : 401,
          backendMsg ?? 'That email does not match this invite.',
        );

      const message =
        backendMsg ??
        'Unable to verify your email right now. Please try again.';

      throw new HttpError(
        typeof status === 'number' ? status : fallbackStatus(err, 500),
        message,
      );
    }

    throw toHttpError(err, {
      status: 500,
      message: 'Unable to verify your email right now. Please try again.',
    });
  }
}

export async function getCandidateCurrentTask(
  candidateSessionId: number,
  token: string,
) {
  ensureAuthToken(token);
  const path = `/candidate/session/${candidateSessionId}/current_task`;

  try {
    return await apiClient.get<CandidateCurrentTaskResponse>(
      path,
      {
        headers: {
          'x-candidate-session-id': String(candidateSessionId),
        },
        cache: 'no-store',
      },
      toClientOptions(token),
    );
  } catch (err: unknown) {
    if (err instanceof TypeError) {
      throw new HttpError(
        0,
        'Network error. Please check your connection and try again.',
      );
    }

    if (err && typeof err === 'object') {
      const status = (err as { status?: unknown }).status;
      if (typeof status !== 'number') {
        throw new HttpError(
          0,
          'Network error. Please check your connection and try again.',
        );
      }
      const backendMsg = extractBackendMessage(
        (err as { details?: unknown }).details,
        false,
      );

      if (status === 404)
        throw new HttpError(
          404,
          backendMsg ?? 'Session not found. Please reopen your invite link.',
        );
      if (status === 410)
        throw new HttpError(410, 'That invite link has expired.');

      const message =
        backendMsg ?? 'Something went wrong loading your current task.';

      throw new HttpError(
        typeof status === 'number' ? status : fallbackStatus(err, 500),
        message,
      );
    }

    throw toHttpError(err, {
      status: 500,
      message: 'Something went wrong loading your current task.',
    });
  }
}

export async function submitCandidateTask(params: {
  taskId: number;
  token: string;
  candidateSessionId: number;
  contentText?: string;
  codeBlob?: string;
}) {
  const { taskId, token, candidateSessionId, contentText, codeBlob } = params;

  ensureAuthToken(token);
  const path = `/tasks/${taskId}/submit`;

  try {
    return await apiClient.post<CandidateTaskSubmitResponse>(
      path,
      {
        ...(typeof contentText === 'string' ? { contentText } : {}),
        ...(typeof codeBlob === 'string' ? { codeBlob } : {}),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-candidate-session-id': String(candidateSessionId),
        },
        cache: 'no-store',
      },
      toClientOptions(token),
    );
  } catch (err: unknown) {
    if (err instanceof TypeError) {
      throw new HttpError(
        0,
        'Network error. Please check your connection and try again.',
      );
    }

    if (err && typeof err === 'object') {
      const status = (err as { status?: unknown }).status;
      const backendMsg = extractBackendMessage(
        (err as { details?: unknown }).details,
        false,
      );

      if (status === 400)
        throw new HttpError(400, backendMsg ?? 'Task out of order.');
      if (status === 404)
        throw new HttpError(
          404,
          backendMsg ?? 'Session mismatch. Please reopen your invite link.',
        );
      if (status === 409)
        throw new HttpError(409, backendMsg ?? 'Task already submitted.');
      if (status === 410)
        throw new HttpError(410, backendMsg ?? 'That invite link has expired.');

      const message =
        backendMsg ?? 'Something went wrong submitting your task.';

      throw new HttpError(
        typeof status === 'number' ? status : fallbackStatus(err, 500),
        message,
      );
    }

    throw toHttpError(err, {
      status: 500,
      message: 'Something went wrong submitting your task.',
    });
  }
}

export async function submitCandidateCodeTask(params: {
  taskId: number;
  token: string;
  candidateSessionId: number;
  codeBlob: string;
}) {
  return submitCandidateTask({
    taskId: params.taskId,
    token: params.token,
    candidateSessionId: params.candidateSessionId,
    codeBlob: params.codeBlob,
  });
}
