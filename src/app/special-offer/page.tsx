'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from './SpecialOffer.module.css';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import PremiumBitcoin3D from '@/components/PremiumBitcoin3D';
import SavingsCalculator from './components/SavingsCalculator';
import ExchangeCard from './components/ExchangeCard';
import RadarPreviewCard from './components/RadarPreviewCard';
import { useTranslation } from '@/lib/LanguageContext';
import { useCryptoData } from './hooks/useCryptoData';



export default function SpecialOfferPage() {
  const { t } = useTranslation();
  const { exchanges, radarPreviews } = useCryptoData();

  return (
    <div className={`${styles['so-page']}`}>
      {/* Animated background blobs */}
      <div className={`${styles['so-bg-effects']}`}>
        <div className={`${styles['so-blob']} ${styles['so-offer-blob-1']}`} />
        <div className={`${styles['so-blob']} ${styles['so-offer-blob-2']}`} />
        <div className={`${styles['so-blob']} ${styles['so-offer-blob-3']}`} />
      </div>

      {/* Hero Section - Split Layout */}
      <section className={`${styles['so-hero']} ${styles['so-hero-padding']}`}>
        <Container>
          <div className={`${styles['so-back-nav']}`}>
            <Link href="/" className="article-back-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="m15 18-6-6 6-6" />
                </svg>
                {t('btn.backToHome')}
            </Link>
          </div>
          
          <div className={`${styles['so-hero-split-layout']}`}>
            {/* Left Column */}
            <div className={`${styles['so-hero-left']}`}>
              <div className={`${styles['so-hero-badge']} flex items-center`}>
                <span className="flex items-center">{t('so.exclusivePartnerDeals')}</span>
              </div>
              <div className={`${styles['so-hero-title-glass-card']}`}>
                <h1 className={`${styles['so-hero-title']}`}>
                  {t('so.hero.save')} <span className={`${styles['so-hero-highlight']}`}>20%</span> {t('so.hero.onEveryTrade')}
                </h1>
              </div>
              <p className={`${styles['so-hero-subtitle']}`}>
                {t('so.hero.subtitle')}
              </p>

              <div className={`${styles['so-trust-inline']}`}>
                <div className={`${styles['so-trust-badge']} flex items-center`}>
                  {t('so.trust.verified')}
                </div>
                <div className={`${styles['so-trust-badge']} flex items-center`}>
                  {t('so.trust.instant')}
                </div>
                <div className={`${styles['so-trust-badge']} flex items-center`}>
                  {t('so.trust.lifetime')}
                </div>
              </div>
            </div>

            {/* Right Column (Calculator) */}
            <div className={`${styles['so-hero-right']}`}>
              <SavingsCalculator />
            </div>
          </div>
        </Container>
      </section>

      {/* Exchange Comparison Matrix � Premium */}
      <section id="exchanges" className={`${styles['so-exchanges-section']}`}>
        <Container>
          {/* Floating orbs behind the exchange grid */}
          <div className={`${styles['so-ex-orbs']}`} aria-hidden="true">
            <div className={`${styles['so-ex-orb']} ${styles['so-ex-orb-1']}`} />
            <div className={`${styles['so-ex-orb']} ${styles['so-ex-orb-2']}`} />
            <div className={`${styles['so-ex-orb']} ${styles['so-ex-orb-3']}`} />
          </div>

          <div className={`${styles['so-section-label']} flex items-center`}>
            <span>{t('so.exchange.title')}</span>
          </div>
          <h2 className={`${styles['so-exchanges-title']}`}>
            {t('so.exchange.topExchanges')}<span className={`${styles['so-gradient-text-animated']}`}>{t('so.exchange.exclusiveRates')}</span>
          </h2>
          <p className={`${styles['so-exchanges-subtitle']}`}>
            {t('so.exchange.subtitle')}
          </p>

          <div className={`${styles['so-exchange-grid']}`}>
            {exchanges.map((ex, idx) => (
              <ExchangeCard key={ex.name} ex={ex as any} idx={idx} t={t} />
            ))}
          </div>

          {/* Trust badges */}
          <div className={`${styles['so-trust-section']}`}>
            <div className={`${styles['so-trust-badge']} flex items-center`}>
              {t('so.trust.verified')}
            </div>
            <div className={`${styles['so-trust-badge']} flex items-center`}>
              {t('so.trust.instant')}
            </div>
            <div className={`${styles['so-trust-badge']} flex items-center`}>
              {t('so.trust.lifetime')}
            </div>
          </div>
        </Container>
      </section>

      {/* FOMO Tracker — Airdrop Radar Teaser — Premium */}
      <section className={`${styles['so-radar-section']}`}>
        <Container>
          <div className={`${styles['so-radar-card']}`}>
            <div className={`${styles['so-radar-glow']}`} />
            <div className={`${styles['so-radar-scanline']}`} />
            <div className={`${styles['so-radar-header']}`}>
              {/* 3D Radar Object */}
              <div className={`${styles['so-radar-3d-wrap']}`}>
                <div className={`${styles['so-radar-3d']}`}>
                  <div className={`${styles['so-radar-3d-core']}`} />
                  <div className={`${styles['so-radar-3d-ring']} ${styles['so-radar-3d-ring-1']}`} />
                  <div className={`${styles['so-radar-3d-ring']} ${styles['so-radar-3d-ring-2']}`} />
                  <div className={`${styles['so-radar-3d-ring']} ${styles['so-radar-3d-ring-3']}`} />
                  <div className={`${styles['so-radar-3d-beam']}`} />
                  <div className={`${styles['so-radar-3d-dot']} ${styles['so-radar-3d-dot-1']}`} />
                  <div className={`${styles['so-radar-3d-dot']} ${styles['so-radar-3d-dot-2']}`} />
                  <div className={`${styles['so-radar-3d-dot']} ${styles['so-radar-3d-dot-3']}`} />
                </div>
                <span className={`${styles['so-radar-ping']}`} />
              </div>
              <div>
                <h2 className={`${styles['so-radar-title']}`}>{t('so.radar.title')}</h2>
                <p className={`${styles['so-radar-desc']}`}>
                  {t('so.radar.desc')}
                </p>
              </div>
            </div>

            {/* Quick preview cards */}
            <div className={`${styles['so-radar-preview-grid']}`}>
              {radarPreviews.map((rp, i) => (
                <RadarPreviewCard key={i} rp={rp as any} t={t} />
              ))}
            </div>

            <Link href="/crypto-events" className={`${styles['so-radar-cta']} flex items-center justify-center`}>
              {t('so.radar.viewTracker')}
              <span className={`${styles['so-cta-arrow']} ml-2`}>→</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Disclaimer */}
      <section className={`${styles['so-disclaimer-section']}`}>
        <Container>
          <p className={`${styles['so-disclaimer']}`}>
            <strong>Disclaimer:</strong> {t('so.disclaimer')}
          </p>
        </Container>
      </section>
    </div>
  );
}
