import type { Metadata } from 'next';
import { Suspense } from 'react';
import CandidateDashboardPage from '@/features/candidate/portal/CandidateDashboardPage';
import { BRAND_NAME } from '@/platform/config/brand';
import { getCachedSessionNormalized } from '@/platform/auth0';

export const metadata: Metadata = {
  title: `Candidate portal | ${BRAND_NAME}`,
  description: `Your ${BRAND_NAME} Trial hub.`,
};

export default async function CandidateDashboardRoute() {
  const session = await getCachedSessionNormalized();
  const signedInEmail =
    session?.user && typeof session.user.email === 'string'
      ? session.user.email
      : null;
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-600">
          Loading your portal…
        </div>
      }
    >
      <CandidateDashboardPage signedInEmail={signedInEmail} />
    </Suspense>
  );
}
