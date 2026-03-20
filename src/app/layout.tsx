import type { Metadata } from 'next';
import { Inter, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import CryptoTicker from '@/components/CryptoTicker';
import TokenRain from '@/components/TokenRain';
import { buildMetadata, buildWebSiteJsonLd } from '@/lib/seo';
import { LanguageProvider } from '@/lib/LanguageContext';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });
const beVietnam = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700', '800'], variable: '--font-vietnamese' });

/**
 * Root layout metadata — applies as fallback to all pages.
 * Individual pages / routes override this with their own generateMetadata.
 */
export const metadata: Metadata = buildMetadata({
  // No title override → uses SITE_META.DEFAULT_TITLE as-is
  allowIndexing: true,
});

const websiteJsonLd = buildWebSiteJsonLd();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${beVietnam.variable}`} suppressHydrationWarning>
      <head>
        {/* WebSite JSON-LD — injected once at root layout level */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <CryptoTicker />
          <Header />
          <main style={{ minHeight: '80vh' }}>
            {children}
          </main>
          <TokenRain />
        </LanguageProvider>
      </body>
    </html>
  );
}

