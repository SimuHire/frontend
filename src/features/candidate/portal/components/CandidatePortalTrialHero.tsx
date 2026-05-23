'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CandidateInvite } from '@/features/candidate/session/api';
import { SCHEDULE_DAY_LABELS } from '@/features/candidate/session/views/SchedulingView.format';
import Button from '@/shared/ui/Button';
import { CountdownTimer } from '@/shared/ui/CountdownTimer';
import { formatRelativePast } from '@/shared/time/relativePast';
import {
  deriveCandidateInviteState,
  isCompletedInvite,
  isReviewRouteInvite,
  isTerminatedInvite,
  normalizeTrialProgress,
  TRIAL_DAY_COUNT,
} from '../utils/candidateInviteViewModel';

function hasTrialSchedule(invite: CandidateInvite): boolean {
  return Boolean(
    invite.scheduleLockedAt ||
    invite.scheduledStartAt ||
    (invite.dayWindows && invite.dayWindows.length > 0),
  );
}

function firstUnlockIso(invite: CandidateInvite): string | null {
  const fromWindow = invite.dayWindows?.[0]?.windowStartAt;
  if (fromWindow) return fromWindow;
  if (invite.scheduledStartAt) return invite.scheduledStartAt;
  return null;
}

type HeroPhase =
  | 'needs_schedule'
  | 'pre_day'
  | 'active'
  | 'completed'
  | 'ended';

function resolveHeroPhase(invite: CandidateInvite, nowMs: number): HeroPhase {
  if (isTerminatedInvite(invite)) return 'ended';
  if (isCompletedInvite(invite) || isReviewRouteInvite(invite))
    return 'completed';
  if (!hasTrialSchedule(invite)) return 'needs_schedule';
  const unlockIso = firstUnlockIso(invite);
  const unlockMs = unlockIso ? Date.parse(unlockIso) : NaN;
  if (Number.isFinite(unlockMs) && nowMs < unlockMs) return 'pre_day';
  return 'active';
}

function formatUnlockLine(iso: string, timezone: string | null): string {
  const tz = timezone?.trim() || 'UTC';
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return '';
  const datePart = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(when);
  const timePart = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(when);
  return `${datePart} at ${timePart} (${tz})`;
}

type Props = {
  invite: CandidateInvite;
  onContinue: (invite: CandidateInvite) => void;
  onContinueIntent: (invite: CandidateInvite) => void;
};

export function CandidatePortalTrialHero({
  invite,
  onContinue,
  onContinueIntent,
}: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const phase = useMemo(() => resolveHeroPhase(invite, nowMs), [invite, nowMs]);
  const derived = useMemo(
    () => deriveCandidateInviteState(invite, nowMs),
    [invite, nowMs],
  );
  const progress = normalizeTrialProgress(invite.progress);
  const timezone =
    invite.candidateTimezone?.trim() ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const company = invite.company?.trim() || 'the hiring team';
  const role = invite.role?.trim() || invite.title?.trim() || 'this role';
  const token = invite.token ?? '';

  const unlockIso = firstUnlockIso(invite);
  const router = useRouter();

  return (
    <article className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Your Trial
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-gray-950">
        {role} <span className="font-normal text-gray-600">at {company}</span>
      </h2>

      {phase === 'needs_schedule' ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm leading-relaxed text-gray-600">
            You haven&apos;t picked a start date yet.
          </p>
          {token ? (
            <Button
              className="w-full sm:w-auto"
              onClick={() =>
                router.push(
                  `/candidate/schedule?token=${encodeURIComponent(token)}`,
                )
              }
              onMouseEnter={() => onContinueIntent(invite)}
              onFocus={() => onContinueIntent(invite)}
            >
              Schedule your start date
            </Button>
          ) : (
            <p className="text-sm text-amber-800">
              Invite link unavailable. Please reopen your invite email.
            </p>
          )}
        </div>
      ) : null}

      {phase === 'pre_day' && unlockIso ? (
        <div className="mt-6 space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Day 1 unlocks {formatUnlockLine(unlockIso, timezone)}.
          </p>
          <div className="rounded-xl border border-wheat-100 bg-wheat-50/60 px-6 py-8">
            <p className="text-sm font-medium text-wheat-900">
              Day 1 unlocks in
            </p>
            <div className="mt-3 flex justify-center">
              <CountdownTimer mode="large" targetAt={unlockIso} />
            </div>
            <p className="mt-4 text-xs text-wheat-800">
              We&apos;ll email you when it begins.
            </p>
            <p className="mt-2 text-xs text-wheat-700 tabular-nums">
              {formatUnlockLine(unlockIso, timezone)}
            </p>
          </div>
        </div>
      ) : null}

      {phase === 'active' ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-700">
            Day {derived.currentDayIndex} of {TRIAL_DAY_COUNT}
          </p>
          <p className="text-sm text-gray-600">
            Today:{' '}
            <span className="font-medium text-gray-900">
              {SCHEDULE_DAY_LABELS[derived.currentDayIndex] ?? 'Trial work'}
            </span>
          </p>
          {progress ? (
            <p className="text-xs text-gray-500">
              Progress: {progress.completed}/{progress.total} days marked
              complete in Winoe
            </p>
          ) : null}
          <Button
            className="w-full sm:w-auto"
            onClick={() => onContinue(invite)}
            onMouseEnter={() => onContinueIntent(invite)}
            onFocus={() => onContinueIntent(invite)}
          >
            Open your Trial
          </Button>
        </div>
      ) : null}

      {phase === 'completed' ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-gray-900">Completed</p>
          <p className="text-sm leading-relaxed text-gray-600">
            Trial submitted{' '}
            {invite.completedAt
              ? formatRelativePast(invite.completedAt, nowMs)
              : 'recently'}
            . Your report is being prepared.
          </p>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => onContinue(invite)}
            onMouseEnter={() => onContinueIntent(invite)}
            onFocus={() => onContinueIntent(invite)}
          >
            Review your submissions
          </Button>
        </div>
      ) : null}

      {phase === 'ended' ? (
        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-700">
            This Trial has ended. If this looks wrong, contact your Talent
            Partner.
          </p>
        </div>
      ) : null}
    </article>
  );
}
