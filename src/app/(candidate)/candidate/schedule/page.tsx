'use client';

import { Suspense } from 'react';
import { CandidateScheduleRedirect } from './CandidateScheduleRedirect';

export default function CandidateSchedulePage() {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto max-w-xl space-y-3 p-8"
          role="status"
          aria-label="Preparing schedule"
        >
          <div className="h-5 w-44 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-full animate-pulse rounded bg-secondary/80" />
        </div>
      }
    >
      <CandidateScheduleRedirect />
    </Suspense>
  );
}
