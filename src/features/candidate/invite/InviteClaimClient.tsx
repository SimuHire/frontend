'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { buildLoginHref } from '@/features/auth/authPaths';
import { claimCandidateInvite } from '@/features/candidate/session/api/invitesApi';
import { fetchInvitePublicSummary } from '@/features/candidate/invite/invitePublicApi';
import {
  clearPendingInviteClaim,
  readPendingInviteClaim,
  savePendingInviteClaim,
} from '@/features/candidate/invite/invitePendingClaim';
import {
  INVITE_ALREADY_CLAIMED_MESSAGE,
  INVITE_INVALID_MESSAGE,
  inviteExpiredWithContact,
} from '@/platform/copy/invite';
import { HttpError } from '@/platform/api-client/errors/errors';

type ErrorKind = 'invalid' | 'expired' | 'claimed' | null;

type Props = {
  token: string;
  signedInEmail: string | null;
};

function readBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function mapInviteQueryError(err: unknown): {
  kind: ErrorKind;
  message: string;
} {
  const status =
    err && typeof err === 'object' && 'status' in err
      ? Number((err as { status: unknown }).status)
      : 500;
  if (status === 404) {
    return { kind: 'invalid', message: INVITE_INVALID_MESSAGE };
  }
  if (status === 410) {
    const details = (
      err as {
        details?: {
          talentPartnerName?: string;
          details?: { talentPartnerName?: string };
        };
      }
    ).details;
    const talentPartnerName =
      details?.talentPartnerName ?? details?.details?.talentPartnerName ?? '';
    return {
      kind: 'expired',
      message: inviteExpiredWithContact(talentPartnerName),
    };
  }
  if (status === 409) {
    return { kind: 'claimed', message: INVITE_ALREADY_CLAIMED_MESSAGE };
  }
  return { kind: 'invalid', message: INVITE_INVALID_MESSAGE };
}

export function InviteClaimClient({ token, signedInEmail }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState(readBrowserTimezone);
  const [formError, setFormError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const autoClaimStartedRef = useRef(false);

  const loginHref = useMemo(
    () => buildLoginHref(`/invite/${encodeURIComponent(token)}`, 'candidate'),
    [token],
  );

  const summaryQuery = useQuery({
    queryKey: ['invite-public-summary', token],
    queryFn: () => fetchInvitePublicSummary(token),
    retry: false,
  });

  const queryError = summaryQuery.isError
    ? mapInviteQueryError(summaryQuery.error)
    : null;

  const runClaim = useCallback(
    async (payload: {
      fullName: string;
      preferredDisplayName: string | null;
      candidateTimezone: string;
    }) => {
      setClaiming(true);
      setFormError(null);
      try {
        await claimCandidateInvite(token, {
          fullName: payload.fullName,
          preferredDisplayName: payload.preferredDisplayName,
          candidateTimezone: payload.candidateTimezone,
        });
        clearPendingInviteClaim(token);
        router.replace('/candidate/portal');
      } catch (err) {
        const status =
          err instanceof HttpError
            ? err.status
            : err && typeof err === 'object' && 'status' in err
              ? Number((err as { status: unknown }).status)
              : 500;
        if (status === 401) {
          savePendingInviteClaim(token, payload);
          window.location.href = loginHref;
          return;
        }
        setFormError(
          err instanceof Error ? err.message : 'Unable to complete setup.',
        );
      } finally {
        setClaiming(false);
      }
    },
    [loginHref, router, token],
  );

  useEffect(() => {
    if (!signedInEmail || !summaryQuery.isSuccess) return;
    if (autoClaimStartedRef.current) return;
    const pending = readPendingInviteClaim(token);
    if (!pending) return;
    autoClaimStartedRef.current = true;
    const timerId = window.setTimeout(() => {
      void runClaim(pending);
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [runClaim, signedInEmail, summaryQuery.isSuccess, token]);

  const onSubmit = () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setFormError('Full name is required.');
      return;
    }
    const payload = {
      fullName: trimmedName,
      preferredDisplayName: displayName.trim() || null,
      candidateTimezone: timezone.trim() || 'UTC',
    };
    if (!signedInEmail) {
      savePendingInviteClaim(token, payload);
      window.location.href = loginHref;
      return;
    }
    void runClaim(payload);
  };

  if (summaryQuery.isPending) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-700 shadow-sm">
        Checking your invite…
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-950">
          {queryError.kind === 'expired'
            ? 'Invite expired'
            : queryError.kind === 'claimed'
              ? 'Already claimed'
              : 'Invite unavailable'}
        </h1>
        <p className="mt-2 text-sm text-gray-700">{queryError.message}</p>
        {queryError.kind === 'claimed' ? (
          <div className="mt-6">
            <a href={loginHref}>
              <Button>Sign in to continue</Button>
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  const summary = summaryQuery.data;
  if (!summary) return null;

  const company = summary.company?.trim() || 'the company';
  const role = summary.role?.trim() || 'your role';

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-950">
        Welcome to your Trial for {role} at {company}
      </h1>
      <p className="mt-2 text-sm text-gray-700">Let&apos;s set you up.</p>
      {!signedInEmail ? (
        <p className="mt-4 text-sm text-gray-600">
          Continue will securely sign you in, then finish setup with the details
          below.
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-gray-800">
          Full name
          <Input
            className="mt-1"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label className="block text-sm font-medium text-gray-800">
          Preferred display name (optional)
          <Input
            className="mt-1"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="nickname"
          />
        </label>
        <label className="block text-sm font-medium text-gray-800">
          Timezone
          <Input
            className="mt-1"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="America/New_York"
          />
        </label>
      </div>
      {formError ? (
        <p className="mt-4 text-sm text-red-700">{formError}</p>
      ) : null}
      <div className="mt-6">
        <Button onClick={onSubmit} disabled={claiming || !fullName.trim()}>
          {claiming ? 'Continuing…' : 'Continue'}
        </Button>
      </div>
      <p className="mt-6 text-xs text-gray-500">
        Your Trial is 5 days of focused work. You can start anytime in the next
        14 days.
      </p>
    </div>
  );
}
