export type PendingInviteClaim = {
  fullName: string;
  preferredDisplayName: string | null;
  candidateTimezone: string;
};

function storageKey(token: string) {
  return `winoe:invite_pending_claim:${token}`;
}

export function savePendingInviteClaim(
  token: string,
  payload: PendingInviteClaim,
): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(storageKey(token), JSON.stringify(payload));
}

export function readPendingInviteClaim(
  token: string,
): PendingInviteClaim | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(storageKey(token));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingInviteClaim;
    if (!parsed || typeof parsed.fullName !== 'string') return null;
    if (typeof parsed.candidateTimezone !== 'string') return null;
    return {
      fullName: parsed.fullName,
      preferredDisplayName:
        typeof parsed.preferredDisplayName === 'string'
          ? parsed.preferredDisplayName
          : null,
      candidateTimezone: parsed.candidateTimezone,
    };
  } catch {
    return null;
  }
}

export function clearPendingInviteClaim(token: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(storageKey(token));
}
