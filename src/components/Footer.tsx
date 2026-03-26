'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/LanguageContext';
import Container from './Container';
import { Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
}

interface ResourceLink {
  label: string;
  href: string;
  isExternal?: boolean;
  hasSparkle?: boolean;
}

interface FooterData {
  brandDescription?: string;
  socialXUrl?: string;
  navLinks?: NavLink[];
  resourceLinks?: ResourceLink[];
  disclaimerTitle?: string;
  disclaimerText?: string;
  copyrightText?: string;
}

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [data, setData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetch('/api/footer-settings')
      .then(res => res.json())
      .then(d => { if (d) setData(d); })
      .catch(() => { /* use i18n defaults */ });
  }, []);

  // Resolve values: Sanity data → i18n fallback
  const brandDesc = data?.brandDescription || t('footer.brandDesc');
  const socialX = data?.socialXUrl || 'https://x.com/DaveyNFTs_';

  const navLinks: NavLink[] = data?.navLinks?.length ? data.navLinks : [
    { label: t('footer.navHome'), href: '/' },
    { label: t('footer.navNews'), href: '/news' },
    { label: t('footer.navArticles'), href: '/articles' },
    { label: t('footer.navPicks'), href: '/picks' },
    { label: t('footer.navEvents'), href: '/events' },
    { label: t('footer.navTweets'), href: '/tweets' },
  ];

  const resourceLinks: ResourceLink[] = data?.resourceLinks?.length ? data.resourceLinks : [
    { label: t('footer.specialOffer'), href: '/special-offer', hasSparkle: true },
    { label: t('footer.cryptoEvents'), href: '/crypto-events' },
    { label: t('footer.followX'), href: socialX, isExternal: true },
  ];

  const disclaimerTitle = data?.disclaimerTitle || t('footer.disclaimerLabel');
  const disclaimerText = data?.disclaimerText || t('footer.disclaimerText');
  const copyrightText = data?.copyrightText || `DaveyNFTs. ${t('footer.allRights')}`;

  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />

      <Container>
        {/* Main Footer Grid */}
        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo-link">
              <span className="footer-logo-text">DaveyNFTs</span>
              <span className="footer-logo-badge">Hub</span>
            </Link>
            <p className="footer-brand-desc">{brandDesc}</p>
            <div className="footer-social">
              <a href={socialX} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="X / Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="footer-nav-col">
            <h4 className="footer-nav-title">{t('footer.navTitle')}</h4>
            <ul className="footer-nav-list">
              {navLinks.map((link, i) => (
                <li key={i}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="footer-nav-col">
            <h4 className="footer-nav-title">{t('footer.resourcesTitle')}</h4>
            <ul className="footer-nav-list">
              {resourceLinks.map((link, i) => (
                <li key={i}>
                  {link.isExternal || link.href.startsWith('http') ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={link.hasSparkle ? 'footer-special-link' : ''}>
                      {link.hasSparkle && <Sparkles size={12} className="footer-sparkle" />}
                      {link.label}
                      <ExternalLink size={10} className="inline ml-0.5 opacity-50" />
                    </a>
                  ) : (
                    <Link href={link.href} className={link.hasSparkle ? 'footer-special-link' : ''}>
                      {link.hasSparkle && <Sparkles size={12} className="footer-sparkle" />}
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="footer-disclaimer">
          <div className="footer-disclaimer-icon">
            <ShieldCheck size={16} />
          </div>
          <div className="footer-disclaimer-content">
            <strong>{disclaimerTitle}</strong>
            <p>{disclaimerText}</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span className="footer-copyright">
            © {year} {copyrightText}
          </span>
        </div>
      </Container>
    </footer>
  );
}
