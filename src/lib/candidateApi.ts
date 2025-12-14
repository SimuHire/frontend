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

export async function resolveCandidateInviteToken(token: string) {
  const url = `${API_BASE}/api/candidate/session/${encodeURIComponent(token)}`;

  let res: Response;
  try {
    res = await fetch(url, { method: "GET", cache: "no-store" });
  } catch {
    throw new HttpError(0, "Network error. Please check your connection and try again.");
  }

  if (!res.ok) {
    if (res.status === 404) throw new HttpError(404, "That invite link is invalid.");
    if (res.status === 410) throw new HttpError(410, "That invite link has expired.");
    throw new HttpError(res.status, "Something went wrong loading your simulation.");
  }

  return (await res.json()) as CandidateSessionBootstrapResponse;
}
