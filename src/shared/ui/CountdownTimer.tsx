'use client';

import { useEffect, useMemo, useState } from 'react';

const tabular = 'tabular-nums';

export type CountdownMode = 'hero' | 'large' | 'inline';

type CountdownTimerProps = {
  targetAt: Date | string | number;
  mode?: CountdownMode;
  className?: string;
  onPast?: () => void;
};

function useCountdownTick(targetMs: number) {
  const [now, setNow] = useState(() => Date.now());
  const remaining = targetMs - now;
  const oneDay = 86400000;
  const interval = remaining > oneDay ? 60000 : 1000;

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [interval, remaining]);

  return { now, remaining: targetMs - now };
}

function formatRemaining(ms: number) {
  if (ms <= 0) return { label: 'Unlocked', parts: null as null };
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (days > 0) {
    return {
      label: `${days}d ${hours}h`,
      parts: { days, hours, minutes: null, seconds: null },
    };
  }
  return {
    label: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    parts: { days: null, hours, minutes, seconds },
  };
}

export function CountdownTimer({
  targetAt,
  mode = 'inline',
  className,
  onPast,
}: CountdownTimerProps) {
  const targetMs = useMemo(
    () =>
      typeof targetAt === 'number' ? targetAt : new Date(targetAt).getTime(),
    [targetAt],
  );
  const { remaining } = useCountdownTick(targetMs);
  const fmt = formatRemaining(remaining);

  useEffect(() => {
    if (remaining <= 0) onPast?.();
  }, [remaining, onPast]);

  const size =
    mode === 'hero'
      ? 'text-3xl sm:text-4xl font-semibold text-wheat-800'
      : mode === 'large'
        ? 'text-2xl sm:text-3xl font-semibold text-gray-950'
        : 'text-lg font-medium text-gray-900';

  return (
    <span
      className={`${tabular} ${size} ${className ?? ''}`.trim()}
      aria-live="polite"
    >
      {fmt.label}
    </span>
  );
}
