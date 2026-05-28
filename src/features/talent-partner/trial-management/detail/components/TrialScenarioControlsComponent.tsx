'use client';
import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { ScenarioControlsSectionProps } from './ScenarioControlsSection';

const LazyScenarioControlsSection = dynamic<ScenarioControlsSectionProps>(
  () =>
    import('./ScenarioControlsSection').then(
      (mod) => mod.ScenarioControlsSection,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-lg border border-strong bg-elevated p-4 shadow-sm"
        role="status"
        aria-label="Preparing Trial controls"
      >
        <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-3 w-full animate-pulse rounded bg-secondary/80" />
      </div>
    ),
  },
);

export let ScenarioControlsSectionComponent: ComponentType<ScenarioControlsSectionProps> =
  LazyScenarioControlsSection;

if (process.env.NODE_ENV === 'test') {
  const scenarioControlsModule =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./ScenarioControlsSection') as typeof import('./ScenarioControlsSection');
  ScenarioControlsSectionComponent =
    scenarioControlsModule.ScenarioControlsSection;
}
