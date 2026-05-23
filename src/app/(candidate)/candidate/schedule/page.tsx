'use client';

import { Suspense } from 'react';
import { CandidateScheduleRedirect } from './CandidateScheduleRedirect';

export default function CandidateSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-600">Loading schedule…</div>
      }
    >
      <CandidateScheduleRedirect />
    </Suspense>
  );
}
