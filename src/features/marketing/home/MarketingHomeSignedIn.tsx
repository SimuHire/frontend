import { marketingContainer } from '../shared/marketingLayout';
import { MarketingLandingPage } from './MarketingLandingPage';

export function MarketingHomeSignedIn({ name }: { name?: string | null }) {
  const greeting =
    typeof name === 'string' && name
      ? `Welcome back, ${name}.`
      : 'Welcome back.';

  return (
    <>
      <div className="border-b border-subtle bg-wheat-50">
        <div className={`${marketingContainer} py-3`}>
          <p className="text-sm text-secondary">{greeting}</p>
        </div>
      </div>
      <MarketingLandingPage showRequestAccessCta={false} />
    </>
  );
}
