'use client';

import { useSearchParams } from 'next/navigation';
import { WheatStalk } from '@/components/illustrations/WheatStalk';
import { useNotifications } from '@/shared/notifications';
import Button from '@/shared/ui/Button';

function BrandedServerError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-6 py-16 text-primary">
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
          <div className="mt-8">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function EdgeStatesClient() {
  const { notify } = useNotifications();
  const searchParams = useSearchParams();

  if (searchParams?.get('state') === '500') {
    return <BrandedServerError />;
  }

  return (
    <main className="min-h-screen bg-primary px-8 py-10 text-primary">
      <section className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
            Local QA
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Edge states</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              notify({
                id: 'qa-success-toast',
                tone: 'success',
                title: 'Invite link copied',
                description: 'The candidate invite is ready to share.',
                sticky: true,
              })
            }
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              notify({
                id: 'qa-error-toast',
                tone: 'error',
                title: 'Unable to send invite',
                description: 'Check the candidate email and try again.',
                sticky: true,
              })
            }
          >
            Error toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              notify({
                id: 'qa-warning-toast',
                tone: 'warning',
                title: 'Report still calibrating',
                description:
                  'Benchmarks will update once the remaining evidence finishes processing.',
                sticky: true,
              })
            }
          >
            Warning toast
          </Button>
        </div>
      </section>
    </main>
  );
}
