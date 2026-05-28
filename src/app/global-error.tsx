'use client';

import { WheatStalk } from '@/components/illustrations/WheatStalk';
import Button from '@/shared/ui/Button';

export type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function GlobalErrorContent({ error, reset }: GlobalErrorProps) {
  const isDev = process.env.NODE_ENV === 'development';
  const detail = isDev
    ? error.message
    : error.digest
      ? `Error id: ${error.digest}`
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-6 py-16 text-primary">
      <section className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          <div className="rounded-full border border-wheat-200 bg-wheat-50 p-10 shadow-sm dark:border-wheat-700 dark:bg-wheat-950">
            <WheatStalk className="h-40 w-40 text-wheat-600 dark:text-wheat-300" />
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-wheat-300 bg-wheat-50 px-3 py-1 text-sm font-medium text-wheat-900 dark:border-wheat-700 dark:bg-wheat-950 dark:text-wheat-100">
            <span className="h-2 w-2 rounded-full bg-wheat-500" />
            Service status: recovering
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            Something went wrong on our end.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-secondary">
            We&apos;ve been notified. Try again in a moment.
          </p>
          {detail ? (
            <p className="mt-4 rounded-md border border-strong bg-secondary px-3 py-2 text-xs text-secondary">
              {detail}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-2">
            <Button onClick={() => reset()}>Retry</Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
            >
              Go home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function GlobalError(props: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <GlobalErrorContent {...props} />
      </body>
    </html>
  );
}
