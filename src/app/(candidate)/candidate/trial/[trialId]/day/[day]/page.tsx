'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCandidateInvites } from '@/features/candidate/session/api';
import { buildLoginHref } from '@/features/auth/authPaths';

export default function CandidateTrialDayRoute() {
  const router = useRouter();
  const params = useParams<{ trialId: string; day: string }>();
  const trialId = Number(params.trialId);

  const q = useQuery({
    queryKey: ['candidate-invites-trial-route', trialId],
    queryFn: () => listCandidateInvites({ skipCache: true }),
    enabled: Number.isFinite(trialId),
  });

  const match = useMemo(() => {
    if (!q.data) return null;
    return q.data.find((i) => i.trialId === trialId) ?? q.data[0] ?? null;
  }, [q.data, trialId]);

  useEffect(() => {
    if (!q.isSuccess) return;
    if (!match?.token) {
      router.replace(buildLoginHref('/candidate/portal', 'candidate'));
      return;
    }
    router.replace(`/candidate/session/${encodeURIComponent(match.token)}`);
  }, [match, q.isSuccess, router]);

  return (
    <div className="p-8 text-center text-gray-700">Opening your Trial…</div>
  );
}
