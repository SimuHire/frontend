import { ReactNode } from 'react';
import { NavigationPerfLogger } from '@/shared/analytics/NavigationPerfLogger';
import { WebVitalsLogger } from '@/shared/analytics/WebVitalsLogger';
import { getCachedSessionNormalized } from '@/platform/auth0';
import { MarketingFooter } from './MarketingFooter';
import { MarketingTopBar } from './MarketingTopBar';

type MarketingShellProps = {
  children: ReactNode;
};

export default async function MarketingShell({
  children,
}: MarketingShellProps) {
  const session = await getCachedSessionNormalized();
  const isAuthed = !!session?.user;

  return (
    <div className="min-h-screen bg-primary text-primary">
      <NavigationPerfLogger />
      <WebVitalsLogger />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-elevated focus:px-3 focus:py-2 focus:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-wheat-500"
      >
        Skip to main content
      </a>
      <MarketingTopBar isAuthed={isAuthed} userName={session?.user?.name} />
      <main id="main-content">{children}</main>
      <MarketingFooter />
    </div>
  );
}
