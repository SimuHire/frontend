'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCandidateSession } from '@/features/candidate/session/CandidateSessionProvider';
import { getUserEmail } from '@/lib/auth0-claims';

function extractInviteToken(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const match = trimmed.match(/candidate-sessions\/([^/?#\s]+)/i);
  if (match?.[1]) return match[1];

  const parts = trimmed.split('/');
  return parts.pop()?.trim() ?? '';
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { state } = useCandidateSession();
  const [inviteInput, setInviteInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const displayEmail = useMemo(
    () =>
      state.verifiedEmail ??
      getUserEmail(user as Record<string, unknown>) ??
      '',
    [state.verifiedEmail, user],
  );

  const activeInviteToken = useMemo(
    () => state.inviteToken ?? '',
    [state.inviteToken],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const token = extractInviteToken(inviteInput || activeInviteToken);
    if (!token) {
      setInputError('Enter a valid invite token or link.');
      return;
    }

    setInputError(null);
    router.push(`/candidate-sessions/${encodeURIComponent(token)}`);
  };

  const handleResume = () => {
    if (!activeInviteToken) return;
    router.push(`/candidate-sessions/${encodeURIComponent(activeInviteToken)}`);
  };

  const hasActiveSession = Boolean(
    state.candidateSessionId && activeInviteToken,
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-gray-900">
          Candidate Portal
        </h1>
        <p className="text-sm text-gray-600">
          {displayEmail
            ? `Signed in as ${displayEmail}`
            : 'Signed in with Auth0'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Active invites / simulations
            </h2>
            <p className="text-sm text-gray-700">
              Continue an invite you claimed or open a new invite link.
            </p>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="invite-link"
            >
              Paste invite link or token
            </label>
            <Input
              id="invite-link"
              name="invite-link"
              placeholder="https://app.simuHire.com/candidate-sessions/ABC123"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
            {inputError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {inputError}
              </div>
            ) : null}
            <div className="flex gap-3">
              <Button type="submit">Continue invite</Button>
              {hasActiveSession ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResume}
                >
                  Resume current invite
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              What to expect
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>Claim your invite with the email that received it.</li>
              <li>We’ll save your session so you can come back any time.</li>
              <li>Have an invite link? Paste it to jump back in.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
