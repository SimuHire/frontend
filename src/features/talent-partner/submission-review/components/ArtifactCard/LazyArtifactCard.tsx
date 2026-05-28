'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { SubmissionArtifact } from '../../types';

type LazyArtifactCardProps = {
  artifact: SubmissionArtifact;
  repoLinkLabel?: string | null;
};

const DeferredArtifactCard = dynamic<LazyArtifactCardProps>(
  () => import('./ArtifactCard').then((mod) => mod.ArtifactCard),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded border border-strong bg-elevated p-4"
        role="status"
        aria-label="Preparing submission artifact"
      >
        <div className="h-4 w-44 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-3 w-full animate-pulse rounded bg-secondary/80" />
      </div>
    ),
  },
);

let ArtifactCardComponent: ComponentType<LazyArtifactCardProps> =
  DeferredArtifactCard;

if (process.env.NODE_ENV === 'test') {
  ArtifactCardComponent =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('./ArtifactCard') as typeof import('./ArtifactCard')).ArtifactCard;
}

export function LazyArtifactCard(props: LazyArtifactCardProps) {
  return <ArtifactCardComponent {...props} />;
}
