import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { MarkdownPreviewProps } from '@/shared/ui/Markdown';
import { LoadingSkeletonBlock } from '@/shared/ui/LoadingSkeletonBlock';

const LazyMarkdownPreview = dynamic(
  () => import('@/shared/ui/Markdown').then((m) => m.MarkdownPreview),
  {
    loading: () => (
      <LoadingSkeletonBlock
        label="Preparing markdown preview"
        className="rounded-md border border-subtle bg-elevated p-3"
        lines={2}
      />
    ),
    ssr: false,
  },
);

let Day5ReflectionMarkdownPreview: ComponentType<MarkdownPreviewProps> =
  LazyMarkdownPreview;

if (process.env.NODE_ENV === 'test') {
  const mod =
    require('@/shared/ui/Markdown') as typeof import('@/shared/ui/Markdown'); // eslint-disable-line @typescript-eslint/no-require-imports
  Day5ReflectionMarkdownPreview = mod.MarkdownPreview;
}

export { Day5ReflectionMarkdownPreview };
