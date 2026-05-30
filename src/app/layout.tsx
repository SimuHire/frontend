import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Source_Serif_4 } from 'next/font/google';
import './globals.css';
import '@/styles/print.css';
import { NotificationsProvider } from '@/shared/notifications';
import { QueryProvider } from '@/shared/query';
import { PUBLIC_THEME_COLOR } from '../../public-theme-color';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
});

const SITE_NAME = 'Winoe AI';
const SITE_TITLE = 'Winoe AI - Real-work Trials for hiring';
const SITE_DESCRIPTION =
  'Winoe AI helps Talent Partners run real-work Trials with Winoe Reports, Winoe Scores, and artifact-backed Evidence Trails.';

export const metadata: Metadata = {
  metadataBase: new URL('https://winoe.ai'),
  title: {
    default: SITE_TITLE,
    template: `${SITE_NAME} - %s`,
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
      { url: '/opengraph-image', width: 1200, height: 630, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      { url: '/twitter-image', width: 1200, height: 630, alt: SITE_NAME },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: PUBLIC_THEME_COLOR,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${sourceSerif.variable}`}
    >
      <body className="font-sans antialiased bg-primary text-primary">
        <QueryProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
