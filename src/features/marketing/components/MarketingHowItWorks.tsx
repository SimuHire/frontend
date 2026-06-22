import {
  marketingContainer,
  marketingSection,
} from '../shared/marketingLayout';
import { StepIcon } from './StepIcon';

const STEPS = [
  {
    icon: 'create' as const,
    title: 'Create the Trial',
    copy: 'Set the role, level, focus areas, and Calibration that define what good work looks like.',
  },
  {
    icon: 'build' as const,
    title: 'Candidates build from scratch',
    copy: 'The Tech Trial captures planning, implementation, handoff, and reflection over five days.',
  },
  {
    icon: 'evidence' as const,
    title: 'Winoe returns the evidence',
    copy: 'The Winoe Report turns the Evidence Trail into a Winoe Score, sub-scores, and cited findings.',
  },
];

export function MarketingHowItWorks() {
  return (
    <section
      className={`${marketingSection} border-y border-subtle bg-secondary/40`}
      aria-labelledby="how-it-works-heading"
    >
      <div className={marketingContainer}>
        <h2
          id="how-it-works-heading"
          className="text-xl font-semibold tracking-tight text-primary sm:text-2xl"
        >
          How a Trial works
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-wheat-300 bg-wheat-50">
                  <StepIcon name={step.icon} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="text-base font-semibold text-primary">
                {step.title}
              </h3>
              <p className="text-sm leading-6 text-secondary">{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
