import {
  marketingContainer,
  marketingEyebrow,
  marketingSection,
} from '../shared/marketingLayout';
import { primaryCtaClass } from '../shared/ctaClasses';

const REQUEST_ACCESS_HREF =
  'mailto:support@winoe.ai?subject=Winoe%20AI%20access%20request';

type MarketingHeroProps = {
  showRequestAccessCta?: boolean;
};

export function MarketingHero({
  showRequestAccessCta = true,
}: MarketingHeroProps) {
  return (
    <section className={`${marketingSection} pt-10 sm:pt-14 lg:pt-16`}>
      <div className={`${marketingContainer} max-w-4xl`}>
        <p className={marketingEyebrow}>Real-work hiring intelligence</p>
        <h1 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-tight text-primary sm:text-4xl lg:text-5xl">
          Reveal the real hire. Prove it with work.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
          Winoe AI replaces interview guesswork with multi-day work Trials,
          artifact-backed evaluation, and a Winoe Report your team can inspect.
        </p>
        {showRequestAccessCta ? (
          <div className="mt-8">
            <a href={REQUEST_ACCESS_HREF} className={primaryCtaClass}>
              Request access
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
