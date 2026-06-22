import Link from 'next/link';
import AuthStartLink from '@/features/auth/AuthStartLink';
import LogoutLink from '@/features/auth/LogoutLink';
import { BRAND_NAME } from '@/platform/config/brand';
import {
  marketingContainer,
  marketingNavLink,
} from '../shared/marketingLayout';
import { primaryCtaClass } from '../shared/ctaClasses';
import { cn } from '@/shared/ui/classnames';

const REQUEST_ACCESS_HREF =
  'mailto:support@winoe.ai?subject=Winoe%20AI%20access%20request';

type MarketingTopBarProps = {
  isAuthed: boolean;
  userName?: string | null;
};

export function MarketingTopBar({ isAuthed, userName }: MarketingTopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-subtle bg-elevated/95 backdrop-blur-sm">
      <div
        className={cn(
          marketingContainer,
          'flex items-center justify-between gap-4 py-3 sm:py-4',
        )}
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wheat-500"
        >
          {BRAND_NAME}
        </Link>

        <nav
          aria-label="Site"
          className="flex flex-wrap items-center justify-end gap-2 sm:gap-3"
        >
          {isAuthed ? (
            <>
              {typeof userName === 'string' && userName ? (
                <span className="hidden text-sm text-secondary md:inline">
                  {userName}
                </span>
              ) : null}
              <Link href="/dashboard" className={marketingNavLink}>
                Dashboard
              </Link>
              <Link href="/candidate/portal" className={marketingNavLink}>
                Candidate portal
              </Link>
              <LogoutLink className={marketingNavLink}>Logout</LogoutLink>
            </>
          ) : (
            <>
              <AuthStartLink
                returnTo="/dashboard"
                mode="talent_partner"
                className={marketingNavLink}
              >
                Talent Partner login
              </AuthStartLink>
              <AuthStartLink
                returnTo="/candidate/portal"
                mode="candidate"
                className={marketingNavLink}
              >
                Candidate portal
              </AuthStartLink>
              <a href={REQUEST_ACCESS_HREF} className={primaryCtaClass}>
                Request access
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
