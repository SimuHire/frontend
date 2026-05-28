'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type {
  Day5ReflectionPanelProps,
  HandoffUploadPanelProps,
} from './CandidateTaskView.types';

const LazyDay5ReflectionPanel = dynamic(
  () =>
    import('./components/Day5ReflectionPanel').then(
      (mod) => mod.Day5ReflectionPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-md border border-strong bg-elevated p-4"
        role="status"
        aria-label="Preparing reflection panel"
      >
        <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-3 w-full animate-pulse rounded bg-secondary/80" />
      </div>
    ),
  },
);

const LazyHandoffUploadPanel = dynamic(
  () =>
    import('./handoff/HandoffUploadPanel').then(
      (mod) => mod.HandoffUploadPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-md border border-strong bg-elevated p-4"
        role="status"
        aria-label="Preparing upload panel"
      >
        <div className="h-4 w-36 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-3 w-full animate-pulse rounded bg-secondary/80" />
      </div>
    ),
  },
);

export let Day5ReflectionPanelComponent: ComponentType<Day5ReflectionPanelProps> =
  LazyDay5ReflectionPanel;
export let HandoffUploadPanelComponent: ComponentType<HandoffUploadPanelProps> =
  LazyHandoffUploadPanel;

if (process.env.NODE_ENV === 'test') {
  const day5Module =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./components/Day5ReflectionPanel') as typeof import('./components/Day5ReflectionPanel');
  Day5ReflectionPanelComponent = day5Module.Day5ReflectionPanel;
  const handoffModule =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./handoff/HandoffUploadPanel') as typeof import('./handoff/HandoffUploadPanel');
  HandoffUploadPanelComponent = handoffModule.HandoffUploadPanel;
}
