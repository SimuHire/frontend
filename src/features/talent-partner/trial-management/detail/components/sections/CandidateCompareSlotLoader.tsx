import { type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { CandidateCompareSlotProps } from './CandidateCompareSlot';

function CompareLoadingState() {
  return (
    <section
      className="rounded-lg border border-strong bg-elevated p-4 shadow-sm"
      role="status"
      aria-label="Preparing Benchmarks"
    >
      <div className="h-4 w-36 animate-pulse rounded bg-secondary" />
      <div className="mt-2 h-3 w-full animate-pulse rounded bg-secondary/80" />
    </section>
  );
}

export function ComparePreparingState() {
  return (
    <section
      className="rounded-lg border border-strong bg-elevated p-4 shadow-sm"
      role="status"
      aria-label="Preparing Benchmarks"
    >
      <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
      <div className="mt-2 h-3 w-full animate-pulse rounded bg-secondary/80" />
    </section>
  );
}

const LazyCandidateCompareSlot = dynamic<CandidateCompareSlotProps>(
  () =>
    import('./CandidateCompareSlot').then((mod) => mod.CandidateCompareSlot),
  {
    ssr: false,
    loading: CompareLoadingState,
  },
);

let CandidateCompareSlotComponent: ComponentType<CandidateCompareSlotProps> =
  LazyCandidateCompareSlot;

if (process.env.NODE_ENV === 'test') {
  const candidateCompareModule =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./CandidateCompareSlot') as typeof import('./CandidateCompareSlot');
  CandidateCompareSlotComponent = candidateCompareModule.CandidateCompareSlot;
}

export { CandidateCompareSlotComponent };
