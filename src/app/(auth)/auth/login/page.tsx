import type { Metadata } from 'next';
import LoginPage from '@/features/auth/LoginPage';

export const metadata: Metadata = {
  title: 'Recruiter login | SimuHire',
  description: 'Sign in to access your SimuHire dashboard.',
};

type SearchParams = Promise<{ returnTo?: string; mode?: string }>;

export default async function LoginRoutePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const returnTo =
    resolved && typeof resolved.returnTo === 'string'
      ? resolved.returnTo
      : undefined;
  const rawMode = resolved?.mode;
  const mode =
    rawMode === 'candidate' || rawMode === 'recruiter' ? rawMode : undefined;
  return <LoginPage returnTo={returnTo} mode={mode} />;
}
