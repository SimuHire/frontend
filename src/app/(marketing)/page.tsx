import type { Metadata } from 'next';
import { getCachedSessionNormalized } from '@/platform/auth0';
import MarketingHomePage from '@/features/marketing/home/MarketingHomePage';

const SITE_NAME = 'Winoe AI';
const SITE_TITLE = 'Winoe AI | Real-work Trials for hiring';
const SITE_DESCRIPTION =
  'Winoe AI helps Talent Partners run real-work Trials with Winoe Reports, Winoe Scores, and artifact-backed Evidence Trails.';

export const metadata: Metadata = {
  metadataBase: new URL('https://winoe.ai'),
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/winoe-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/winoe-icon.svg',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      { url: '/og-image.svg', width: 1200, height: 630, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default async function HomePage() {
  const session = await getCachedSessionNormalized();
  return <MarketingHomePage user={session?.user} />;
}
