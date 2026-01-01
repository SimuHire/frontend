import type { Metadata } from 'next';
import CandidateDashboardPage from '@/features/candidate/dashboard/CandidateDashboardPage';

export const metadata: Metadata = {
  title: 'Candidate dashboard | SimuHire',
  description: 'Continue your SimuHire simulations and invites.',
};

export default function CandidateDashboardRoute() {
  return <CandidateDashboardPage />;
}
