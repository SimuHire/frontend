import Button from '@/shared/ui/Button';

type Props = {
  dayIndex: number;
  loading: boolean;
  refreshing: boolean;
  readOnly: boolean;
  onRefresh: () => void;
};

export function WorkspacePanelHeader({
  dayIndex,
  loading,
  refreshing,
  readOnly,
  onRefresh,
}: Props) {
  const heading =
    dayIndex === 2
      ? 'Day 2 — Implementation Kickoff'
      : dayIndex === 3
        ? 'Day 3 — Implementation Wrap-Up'
        : 'Codespace workspace';
  const description =
    dayIndex === 2
      ? 'Build from scratch in your Codespace. AI tools welcome.'
      : dayIndex === 3
        ? 'Continue in the same Codespace. Polish and finalize.'
        : readOnly
          ? 'Workspace actions are paused while this day is closed.'
          : 'Day 2 and Day 3 implementation work must happen in GitHub Codespaces only.';

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-gray-900">{heading}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
      <Button
        variant="secondary"
        onClick={onRefresh}
        disabled={readOnly || loading || refreshing}
      >
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </Button>
    </div>
  );
}
