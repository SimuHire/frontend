'use client';

import Button from '@/shared/ui/Button';

type HeaderProps = {
  onClick: () => void;
  disabled: boolean;
  label: string;
};

export function RunTestsPanelHeader({ onClick, disabled, label }: HeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-gray-900">Run tests</div>
        <div className="text-xs text-gray-600">
          GitHub Actions dispatch, polling, and logs stay tied to this Trial.
        </div>
      </div>
      <Button onClick={onClick} disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}
