'use client';

import dynamic from 'next/dynamic';
import type { MarkdownPreviewProps } from './Markdown';
import { LoadingSkeletonBlock } from './LoadingSkeletonBlock';

export const LazyMarkdownPreview = dynamic<MarkdownPreviewProps>(
  () => import('./Markdown').then((mod) => mod.MarkdownPreview),
  {
    ssr: false,
    loading: () => (
      <LoadingSkeletonBlock
        label="Preparing markdown preview"
        className="rounded-md border border-subtle bg-elevated p-3"
        lines={2}
      />
    ),
  },
);
