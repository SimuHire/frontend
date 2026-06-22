import {
  marketingContainer,
  marketingSection,
} from '../shared/marketingLayout';

export function MarketingDifferentiator() {
  return (
    <section
      className={marketingSection}
      aria-labelledby="differentiator-heading"
    >
      <div className={`${marketingContainer} max-w-3xl`}>
        <h2 id="differentiator-heading" className="sr-only">
          Why Winoe is different
        </h2>
        <blockquote className="border-l-2 border-wheat-500 pl-5 text-lg leading-8 text-primary sm:text-xl sm:leading-9">
          Interviews show who can explain work under pressure. Winoe shows who
          can actually do the work over time — and links every judgment back to
          the artifacts.
        </blockquote>
      </div>
    </section>
  );
}
