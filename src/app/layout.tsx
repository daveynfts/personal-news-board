import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import CryptoTicker from '@/components/CryptoTicker';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CryptoTicker />
        <div className="app-container">
          <header className="app-header">
            <div className="logo">
              <div className="logo-icon">
                <a href="https://x.com/DaveyNFTs_" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img src="/logo.png" alt="Board Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                </a>
              </div>
              <h1>DaveyNFTs</h1>
            </div>
            <nav className="main-nav">
              <Link href="/" className="nav-link">HOME</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
