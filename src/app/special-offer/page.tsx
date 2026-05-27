import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import SpecialOfferContent from './SpecialOfferContent';

// ── SEO Metadata (now works since this is a Server Component) ─────────────────
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Special Offer — Exclusive Partner Deals',
    description:
      'Save 20% on every crypto trade with exclusive partner referral links. Verified deals from top exchanges curated by DaveyNFTs.',
    canonicalPath: '/special-offer',
    type: 'website',
    keywords: [
      'crypto exchange deals',
      'trading fee discount',
      'referral bonus',
      'DaveyNFTs',
      'crypto savings',
      'exchange comparison',
    ],
    allowIndexing: true,
  });
}

export default function SpecialOfferPage() {
  return <SpecialOfferContent />;
}
