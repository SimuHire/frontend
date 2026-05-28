import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BRAND_NAME } from '@/platform/config/brand';
import BenchmarksComparePage from '@/features/talent-partner/benchmarks/BenchmarksComparePage';

export const metadata: Metadata = {
  title: `Compare benchmarks | ${BRAND_NAME}`,
  description:
    'Side-by-side benchmark comparison for candidates from the same Trial.',
};

function BenchmarksCompareFallback() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            Side-by-side comparison
          </h1>
          <p className="text-sm text-secondary">
            Same Trial. Same Winoe instance. Same rubric.
          </p>
        </header>
        <div className="rounded border border-subtle bg-elevated p-4">
          <div
            className="space-y-2"
            role="status"
            aria-label="Preparing benchmark comparison"
          >
            <div className="h-4 w-48 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-full animate-pulse rounded bg-secondary/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<BenchmarksCompareFallback />}>
      <BenchmarksComparePage />
    </Suspense>
  );
}
