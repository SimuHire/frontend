import type { Metadata } from 'next';
import { Suspense } from 'react';
import CandidateDashboardPage from '@/features/candidate/portal/CandidateDashboardPage';
import { BRAND_NAME } from '@/platform/config/brand';
import { getCachedSessionNormalized } from '@/platform/auth0';

export const metadata: Metadata = {
  title: `Candidate portal | ${BRAND_NAME}`,
  description: `Your ${BRAND_NAME} Trial hub.`,
};

export default async function CandidatePortalRoute() {
  const session = await getCachedSessionNormalized();
  const signedInEmail =
    session?.user && typeof session.user.email === 'string'
      ? session.user.email
      : null;
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto max-w-3xl space-y-3 p-8"
          role="status"
          aria-label="Preparing candidate portal"
        >
          <div className="h-6 w-48 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-full animate-pulse rounded bg-secondary/80" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-secondary/80" />
        </div>
      }
    >
      <CandidateDashboardPage signedInEmail={signedInEmail} />
    </Suspense>
  );
}
