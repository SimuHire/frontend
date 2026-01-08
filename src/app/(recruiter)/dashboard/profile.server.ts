import type { RecruiterProfile } from '@/types/recruiter';
import { getAccessToken } from '@/lib/auth0';
import { getBackendBaseUrl } from '@/lib/server/bff';

type ProfileResult = { profile: RecruiterProfile | null; error: string | null };
const DEBUG_PERF = process.env.TENON_DEBUG_PERF;

export async function fetchRecruiterProfile(): Promise<ProfileResult> {
  const start = DEBUG_PERF ? Date.now() : null;
  try {
    const accessToken = await getAccessToken();
    const backendBase = getBackendBaseUrl();

    const response = await fetch(`${backendBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (start !== null) {
      // eslint-disable-next-line no-console
      console.log(
        `[perf:profile] /api/auth/me -> ${response.status} ${Date.now() - start}ms`,
      );
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      return {
        profile: null,
        error: `Unable to fetch profile (status ${response.status})${
          bodyText ? `: ${bodyText}` : ''
        }`,
      };
    }

    const profile = (await response.json()) as RecruiterProfile;
    return { profile, error: null };
  } catch (e) {
    const message =
      e instanceof Error
        ? `Unexpected error while loading profile: ${e.message}`
        : 'Unexpected error while loading profile';
    return { profile: null, error: message };
  }
}
