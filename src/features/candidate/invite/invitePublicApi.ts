import { apiClient } from '@/platform/api-client/client';
import { HttpError, toHttpError } from '@/platform/api-client/errors/errors';

export type InvitePublicSummary = {
  state: 'ready';
  role: string;
  company: string | null;
  talentPartnerName: string | null;
  expiresAt?: string | null;
};

export async function fetchInvitePublicSummary(
  token: string,
  options?: { signal?: AbortSignal },
): Promise<InvitePublicSummary> {
  try {
    return await apiClient.get<InvitePublicSummary>(
      `/candidate/invite-tokens/${encodeURIComponent(token)}/summary`,
      { cache: 'no-store', signal: options?.signal },
      { skipAuth: true },
    );
  } catch (err) {
    const httpError = toHttpError(err, {
      status: 500,
      message: 'Invite check failed.',
    });
    if (err && typeof err === 'object' && 'details' in err) {
      const details = (err as { details?: unknown }).details;
      if (details !== undefined) {
        (httpError as HttpError & { details?: unknown }).details = details;
      }
    }
    throw httpError;
  }
}
