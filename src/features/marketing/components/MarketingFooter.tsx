import Link from 'next/link';
import { BRAND_NAME } from '@/platform/config/brand';
import { marketingContainer } from '../shared/marketingLayout';

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-subtle bg-secondary/60">
      <div
        className={`${marketingContainer} flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between`}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wheat-500"
        >
          {BRAND_NAME}
        </Link>
        <p className="text-sm text-secondary">
          © {year} {BRAND_NAME} AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
