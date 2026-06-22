import { MarketingCredibilityBand } from '../components/MarketingCredibilityBand';
import { MarketingDifferentiator } from '../components/MarketingDifferentiator';
import { MarketingHero } from '../components/MarketingHero';
import { MarketingHowItWorks } from '../components/MarketingHowItWorks';
import { MarketingProofVisual } from '../components/MarketingProofVisual';

type MarketingLandingPageProps = {
  showRequestAccessCta?: boolean;
};

export function MarketingLandingPage({
  showRequestAccessCta = true,
}: MarketingLandingPageProps) {
  return (
    <>
      <MarketingHero showRequestAccessCta={showRequestAccessCta} />
      <MarketingProofVisual />
      <MarketingHowItWorks />
      <MarketingDifferentiator />
      <MarketingCredibilityBand />
    </>
  );
}
