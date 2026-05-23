import type { Metadata } from 'next';
import { InviteClaimClient } from '@/features/candidate/invite/InviteClaimClient';
import { BRAND_NAME } from '@/platform/config/brand';
import { getCachedSessionNormalized } from '@/platform/auth0';

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  await params;
  return {
    title: `Trial invite | ${BRAND_NAME}`,
    description: 'Claim your Winoe Trial invite.',
    robots: { index: false, follow: false },
  };
}

export default async function InviteTokenPage({ params }: PageProps) {
  const { token } = await params;
  const session = await getCachedSessionNormalized();
  const signedInEmail =
    session?.user && typeof session.user.email === 'string'
      ? session.user.email
      : null;

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-16">
      <InviteClaimClient token={token} signedInEmail={signedInEmail} />
    </div>
  );
}
