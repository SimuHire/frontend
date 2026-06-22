import {
  marketingContainer,
  marketingSection,
} from '../shared/marketingLayout';

export function MarketingCredibilityBand() {
  return (
    <section
      className={`${marketingSection} border-t border-subtle bg-elevated`}
      aria-labelledby="credibility-heading"
    >
      <div className={`${marketingContainer} max-w-3xl text-center`}>
        <h2 id="credibility-heading" className="sr-only">
          Credibility
        </h2>
        <p className="text-base leading-7 text-secondary sm:text-lg">
          Currently onboarding design partners for technical hiring teams.
        </p>
      </div>
    </section>
  );
}
