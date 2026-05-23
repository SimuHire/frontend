'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { listCandidateInvites } from '@/features/candidate/session/api';

export function CandidateScheduleRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const invitesQuery = useQuery({
    queryKey: ['candidate-invites-schedule-route'],
    queryFn: () => listCandidateInvites({ skipCache: true }),
    enabled: !tokenFromUrl,
    retry: 1,
  });

  useEffect(() => {
    if (tokenFromUrl) {
      router.replace(`/candidate/session/${encodeURIComponent(tokenFromUrl)}`);
      return;
    }
    if (!invitesQuery.isSuccess) return;
    const token =
      invitesQuery.data.find((invite) => invite.token?.trim())?.token ?? null;
    if (token) {
      router.replace(`/candidate/session/${encodeURIComponent(token)}`);
      return;
    }
    router.replace('/candidate/portal?schedule=unavailable');
  }, [invitesQuery.isSuccess, invitesQuery.data, router, tokenFromUrl]);

  if (invitesQuery.isError && !tokenFromUrl) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center text-gray-700">
        <p>We couldn&apos;t open scheduling right now.</p>
        <p className="mt-2 text-sm text-gray-600">
          Return to your portal and try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-8 text-center text-gray-700">
      Opening scheduling…
    </div>
  );
}
