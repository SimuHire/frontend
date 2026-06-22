import Image from 'next/image';
import {
  marketingContainer,
  marketingSection,
} from '../shared/marketingLayout';

const PROOF_IMAGE = '/marketing/winoe-report-preview.png';

export function MarketingProofVisual() {
  return (
    <section
      className={`${marketingSection} pt-0`}
      aria-labelledby="proof-heading"
    >
      <div className={marketingContainer}>
        <h2 id="proof-heading" className="sr-only">
          Winoe Report preview
        </h2>
        <div className="overflow-hidden rounded-xl border border-subtle bg-elevated shadow-lg">
          <Image
            src={PROOF_IMAGE}
            alt="Winoe Report showing a Winoe Score of 84, dimensional sub-scores, and an Evidence Trail with cited commits, design doc sections, and demo transcript timestamps."
            width={1400}
            height={900}
            priority
            className="h-auto w-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          />
        </div>
      </div>
    </section>
  );
}
