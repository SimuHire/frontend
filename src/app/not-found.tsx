import Link from 'next/link';
import { cookies } from 'next/headers';
import { WheatStalk } from '@/components/illustrations/WheatStalk';
import { isAuthCookie } from '@/platform/auth/authCookies';

export default async function NotFound() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.getAll().some((cookie) => {
    return isAuthCookie(cookie.name);
  });
  const href = isAuthenticated ? '/dashboard' : '/auth/login';
  const cta = isAuthenticated ? 'Back to dashboard' : 'Back to login';

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-6 py-16 text-primary">
      <section className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          <div className="rounded-full border border-wheat-200 bg-wheat-50 p-10 shadow-sm dark:border-wheat-700 dark:bg-wheat-950">
            <WheatStalk className="h-40 w-40 text-wheat-600 dark:text-wheat-300" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wheat-700 dark:text-wheat-300">
            Page unavailable
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            We can&apos;t find this page.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-secondary">
            It may have moved or never existed. Let&apos;s get you back on
            track.
          </p>
          <Link
            href={href}
            className="mt-8 inline-flex rounded-md border border-transparent bg-wheat-500 px-4 py-2 text-sm font-semibold text-on-accent shadow-sm transition hover:bg-wheat-700 focus:outline-none focus:ring-2 focus:ring-wheat-500 focus:ring-offset-2"
          >
            {cta}
          </Link>
        </div>
      </section>
    </main>
  );
}
