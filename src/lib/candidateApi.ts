export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type SimulationSummary = { title: string; role: string };

export type CandidateSessionBootstrapResponse = {
  candidateSessionId: number;
  status: "not_started" | "in_progress" | "completed" | "expired";
  simulation: SimulationSummary;
};

type TaskType = "design" | "code" | "debug" | "handoff" | "documentation" | string;

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

async function safeFetch(url: string, init: RequestInit) {
  let res: Response;
  try {
    res = await fetch(url, { ...init, cache: "no-store" });
  } catch {
    throw new HttpError(0, "Network error. Please check your connection and try again.");
  }
  return res;
}


export async function resolveCandidateInviteToken(token: string) {
  const url = `${API_BASE}/api/candidate/session/${encodeURIComponent(token)}`;

  const res = await safeFetch(url, { method: "GET" });

  if (!res.ok) {
    if (res.status === 404) throw new HttpError(404, "That invite link is invalid.");
    if (res.status === 410) throw new HttpError(410, "That invite link has expired.");
    throw new HttpError(res.status, "Something went wrong loading your simulation.");
  }

  return (await res.json()) as CandidateSessionBootstrapResponse;
}


export async function getCandidateCurrentTask(candidateSessionId: number, token: string) {
  const url = `${API_BASE}/api/candidate/session/${candidateSessionId}/current_task`;

  const res = await safeFetch(url, {
    method: "GET",
    headers: {
      "x-candidate-token": token,
    },
  });

  if (!res.ok) {
    if (res.status === 404) throw new HttpError(404, "Session not found. Please reopen your invite link.");
    if (res.status === 410) throw new HttpError(410, "That invite link has expired.");
    throw new HttpError(res.status, "Something went wrong loading your current task.");
  }

  return (await res.json()) as CandidateCurrentTaskResponse;
}


export async function submitCandidateTask(params: {
  taskId: number;
  token: string;
  candidateSessionId: number;
  contentText?: string;
  codeBlob?: string;
}) {
  const { taskId, token, candidateSessionId, contentText, codeBlob } = params;

  const url = `${API_BASE}/api/tasks/${taskId}/submit`;

  const res = await safeFetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-candidate-token": token,
      "x-candidate-session-id": String(candidateSessionId),
    },
    body: JSON.stringify({
      ...(typeof contentText === "string" ? { contentText } : {}),
      ...(typeof codeBlob === "string" ? { codeBlob } : {}),
    }),
  });

  if (!res.ok) {
    if (res.status === 400) throw new HttpError(400, "Task out of order.");
    if (res.status === 404) throw new HttpError(404, "Session mismatch. Please reopen your invite link.");
    if (res.status === 409) throw new HttpError(409, "Task already submitted.");
    throw new HttpError(res.status, "Something went wrong submitting your task.");
  }

  return (await res.json()) as unknown;
}
