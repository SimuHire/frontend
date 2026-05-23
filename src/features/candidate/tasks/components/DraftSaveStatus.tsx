import { memo } from 'react';
import type { TaskDraftAutosaveStatus } from '../hooks/useTaskDraftAutosave';

type Props = {
  status: TaskDraftAutosaveStatus;
  lastSavedAt: number | null;
  restoreApplied: boolean;
  error: string | null;
  className?: string;
};

const savedAtFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

function formatSavedRelative(value: number): string {
  const delta = Date.now() - value;
  if (delta < 45_000) return 'just now';
  if (delta < 3600_000) {
    const m = Math.floor(delta / 60_000);
    return `${m}m ago`;
  }
  return savedAtFormatter.format(new Date(value));
}

export const DraftSaveStatus = memo(function DraftSaveStatus({
  status,
  lastSavedAt,
  restoreApplied,
  error,
  className,
}: Props) {
  const parts: string[] = [];
  if (restoreApplied) parts.push('Draft restored');

  if (status === 'saving') {
    parts.push('Saving…');
  } else if (status === 'saved') {
    parts.push(
      lastSavedAt ? `Saved ${formatSavedRelative(lastSavedAt)}` : 'Saved',
    );
  } else if (status === 'error') {
    parts.push('Couldn’t save — check connection');
  } else if (status === 'disabled' && error) {
    parts.push(error);
  }

  if (!parts.length) return null;

  return (
    <p
      aria-live="polite"
      className={className ?? 'text-xs font-medium text-gray-600'}
      title={status === 'error' && error ? error : undefined}
    >
      {parts.join(' • ')}
    </p>
  );
});
