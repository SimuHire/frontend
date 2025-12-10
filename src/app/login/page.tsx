'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <PageHeader
          title="Recruiter login"
          subtitle="Sign in to access your SimuHire dashboard."
        />
        <div className="rounded-lg border px-6 py-8 shadow-sm">
          <p className="mb-4 text-sm text-gray-600">
            You will be redirected to Auth0 to sign in securely.
          </p>
          <Button type="button" className="w-full justify-center text-base font-medium" onClick={handleLogin}>
            Continue with Auth0
          </Button>
        </div>
      </div>
    </main>
  );
}
