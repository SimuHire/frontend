'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { WheatStalk } from '@/components/illustrations/WheatStalk';
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
          expiresAt?: string;
          details?: { talentPartnerName?: string; expiresAt?: string };
        };
      }
    ).details;
    const talentPartnerName =
      details?.talentPartnerName ?? details?.details?.talentPartnerName ?? '';
    const expiresAt =
      typeof details?.expiresAt === 'string'
        ? details.expiresAt
        : typeof details?.details?.expiresAt === 'string'
          ? details.details.expiresAt
          : null;
    return {
      kind: 'expired',
      message: inviteExpiredWithContact(
        talentPartnerName,
        formatInviteDate(expiresAt),
      ),
    };
  }
  if (status === 409) {
    return { kind: 'claimed', message: INVITE_ALREADY_CLAIMED_MESSAGE };
  }
  return { kind: 'invalid', message: INVITE_INVALID_MESSAGE };
}

function formatInviteDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
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
      <div className="mx-auto max-w-md rounded-lg border border-strong bg-elevated p-8 shadow-sm">
        <div className="mb-5 flex justify-center">
          <WheatStalk className="h-12 w-12 text-wheat-600" />
        </div>
        <div className="space-y-3" aria-label="Checking invite" role="status">
          <div className="h-4 w-40 rounded-full bg-secondary" />
          <div className="h-3 w-full rounded-full bg-secondary" />
          <div className="h-3 w-5/6 rounded-full bg-secondary" />
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-strong bg-elevated p-8 text-center shadow-sm">
        <div className="mb-5 flex justify-center">
          <WheatStalk className="h-14 w-14 text-wheat-600" />
        </div>
        <h1 className="text-xl font-semibold text-primary">
          {queryError.kind === 'expired'
            ? 'Invite expired'
            : queryError.kind === 'claimed'
              ? 'Already claimed'
              : 'Invite unavailable'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary">
          {queryError.message}
        </p>
        <div className="mt-6">
          <a href={loginHref}>
            <Button>Sign in →</Button>
          </a>
        </div>
      </div>
    );
  }

  const summary = summaryQuery.data;
  if (!summary) return null;

  const company = summary.company?.trim() || 'the company';
  const role = summary.role?.trim() || 'your role';

  return (
    <div className="mx-auto max-w-md rounded-lg border border-strong bg-elevated p-8 shadow-sm">
      <div className="mb-5 flex justify-center">
        <WheatStalk className="h-14 w-14 text-wheat-600" />
      </div>
      <h1 className="text-xl font-semibold text-primary">
        Welcome to Winoe, your Trial for {role} at {company}
      </h1>
      <p className="mt-2 text-sm text-secondary">Let&apos;s set you up.</p>
      {!signedInEmail ? (
        <p className="mt-4 text-sm text-secondary">
          Continue will securely sign you in, then finish setup with the details
          below.
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-primary">
          Full name
          <Input
            className="mt-1"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label className="block text-sm font-medium text-primary">
          Preferred display name (optional)
          <Input
            className="mt-1"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="nickname"
          />
        </label>
        <label className="block text-sm font-medium text-primary">
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
        <p className="mt-4 text-sm text-danger">{formError}</p>
      ) : null}
      <div className="mt-6">
        <Button onClick={onSubmit} disabled={claiming || !fullName.trim()}>
          {claiming ? 'Continuing…' : 'Continue'}
        </Button>
      </div>
      <p className="mt-6 text-xs text-tertiary">
        Your Trial is 5 days of focused work. You can start anytime in the next
        14 days.
      </p>
    </div>
  );
}
