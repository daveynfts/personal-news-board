import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import CryptoTicker from '@/components/CryptoTicker';
import TokenRain from '@/components/TokenRain';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Personal Board | Elite Curation',
  description: 'A premium, personal collection of top news, insightful blogs, and interesting X threads.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <CryptoTicker />
        <Header />
        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>
        <TokenRain />
      </body>
    </html>
  );
}

