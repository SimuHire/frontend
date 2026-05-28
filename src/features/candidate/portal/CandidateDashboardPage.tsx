'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { buildLoginHref } from '@/features/auth/authPaths';
import { useCandidateSession } from '../session/CandidateSessionProvider';
import { CandidatePortalFaq } from './components/CandidatePortalFaq';
import { CandidatePortalTrialHero } from './components/CandidatePortalTrialHero';
import { DashboardHeader } from './components/DashboardHeader';
import { useCandidateDashboardActions } from './hooks/useCandidateDashboardActions';
import { useCandidateInvites } from './hooks/useCandidateInvites';
import { extractInviteToken } from './utils/inviteTokensUtils';

export { extractInviteToken };

export default function CandidateDashboardPage({
  signedInEmail,
}: {
  signedInEmail?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const scheduleUnavailable = searchParams.get('schedule') === 'unavailable';
  const { state } = useCandidateSession();
  const handleAuthRequired = useCallback(() => {
    router.replace(buildLoginHref('/candidate/portal', 'candidate'));
  }, [router]);
  const { sortedInvites, loading, error, refresh, setError } =
    useCandidateInvites(signedInEmail ?? null, handleAuthRequired);

  const displayEmail = useMemo(() => signedInEmail ?? '', [signedInEmail]);
  const { handleContinue, prefetchContinue } = useCandidateDashboardActions({
    router,
    queryClient,
    candidateSessionId: state.candidateSessionId,
    inviteToken: state.inviteToken,
    setError,
  });

  const primaryInvite = sortedInvites[0] ?? null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col gap-8 py-10">
      <div className="px-6">
        <DashboardHeader email={displayEmail} />
      </div>

      {loading ? (
        <div
          className="mx-6 rounded-2xl border border-dashed border-strong bg-elevated p-10"
          role="status"
          aria-label="Preparing your Trial"
        >
          <div className="mx-auto h-4 w-40 animate-pulse rounded bg-secondary" />
          <div className="mx-auto mt-2 h-3 w-64 animate-pulse rounded bg-secondary/80" />
        </div>
      ) : null}

      {scheduleUnavailable ? (
        <div className="mx-6 rounded-md border border-wheat-200 bg-wheat-50 p-4 text-sm text-wheat-900">
          Scheduling isn&apos;t available from this link right now. If you
          already claimed your invite, open it from your email or contact your
          Talent Partner.
        </div>
      ) : null}

      {error ? (
        <div className="mx-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => refresh()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error && !primaryInvite ? (
        <div className="mx-6 rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
          No active Trial is linked to this account yet. Open your invite link
          from email, or sign in with the address your Talent Partner used.
        </div>
      ) : null}

      {primaryInvite ? (
        <div className="space-y-4 px-6">
          <CandidatePortalTrialHero
            invite={primaryInvite}
            onContinue={handleContinue}
            onContinueIntent={prefetchContinue}
          />
          {sortedInvites.length > 1 ? (
            <p className="text-center text-xs text-gray-500">
              You have more than one Trial on this account; this page shows your
              most recent one first.
            </p>
          ) : null}
        </div>
      ) : null}

      <CandidatePortalFaq />
    </div>
  );
}
