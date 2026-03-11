'use client';

import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';

export default function Header() {
  return (
    <header className="app-header">
      <Container className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <div className="logo-icon">
            <a href="https://x.com/DaveyNFTs_" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
              <Image src="/logo.png" alt="Board Logo" fill style={{ objectFit: 'cover', borderRadius: 'inherit' }} />
            </a>
          </div>
          <h1>DaveyNFTs</h1>
        </div>
        <nav className="main-nav">
          <Link href="/" className="nav-link">HOME</Link>
          <Link href="/admin" className="nav-link">ADMIN</Link>
        </nav>
      </Container>
    </header>
  );
}
