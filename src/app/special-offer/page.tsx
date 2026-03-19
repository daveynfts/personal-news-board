'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import { useTranslation } from '@/lib/LanguageContext';

interface ExchangeData {
  name: string;
  badge: string;
  badgeColor: string;
  bonus: string;
  gradient: string;
  glowColor: string;
  logo: string;
  features: string[];
  link: string;
}

interface RadarPreview {
  status: string;
  statusLabel: string;
  name: string;
  token: string;
  apr: string;
}

const defaultExchanges: ExchangeData[] = [
  { name: 'Binance', badge: 'Best for P2P', badgeColor: '#f0b90b', bonus: 'Up to $600 Bonus', gradient: 'linear-gradient(135deg, #f0b90b 0%, #d4a20a 50%, #b8890a 100%)', glowColor: 'rgba(240, 185, 11, 0.3)', logo: '🟡', features: ['Lowest spot fees', '350+ cryptos', '#1 by volume'], link: '#' },
  { name: 'Bybit', badge: 'Lowest Futures Fees', badgeColor: '#f7a600', bonus: 'Up to $500 Bonus', gradient: 'linear-gradient(135deg, #f7a600 0%, #ff6b00 50%, #e85d00 100%)', glowColor: 'rgba(247, 166, 0, 0.3)', logo: '🟠', features: ['Copy trading', 'Leveraged tokens', 'Fast execution'], link: '#' },
  { name: 'OKX', badge: 'Best for DeFi', badgeColor: '#00d4aa', bonus: 'Up to $500 Bonus', gradient: 'linear-gradient(135deg, #00d4aa 0%, #00b894 50%, #009d80 100%)', glowColor: 'rgba(0, 212, 170, 0.3)', logo: '🟢', features: ['Web3 wallet', 'DEX aggregator', 'Earn up to 20% APY'], link: '#' },
];

const defaultRadarPreviews: RadarPreview[] = [
  { status: 'live', statusLabel: '🔴 LIVE', name: 'Binance Launchpool', token: '$KERNEL', apr: 'Est. APR: ~45%' },
  { status: 'upcoming', statusLabel: '⏳ UPCOMING', name: 'Binance Megadrop', token: '$SOLV', apr: 'Snapshot in 3 days' },
  { status: 'hot', statusLabel: '🔥 HOT', name: 'Bybit Launchpool', token: '$INIT', apr: 'Est. APR: ~32%' },
];

export default function SpecialOfferPage() {
  const { t } = useTranslation();
  const [volume, setVolume] = useState(50000);
  const [animatedSavings, setAnimatedSavings] = useState(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [exchanges, setExchanges] = useState<ExchangeData[]>(defaultExchanges);
  const [radarPreviews, setRadarPreviews] = useState<RadarPreview[]>(defaultRadarPreviews);

  // Fetch exchanges from API
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/exchanges');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setExchanges(data.map((ex: { name: string; badge: string; badgeColor: string; bonus: string; gradient: string; glowColor: string; logo: string; features: string; link: string }) => ({
          ...ex,
          features: (() => { try { return JSON.parse(ex.features); } catch { return []; } })(),
        })));
      }
    } catch { /* use defaults */ }

    try {
      const res = await fetch('/api/crypto-events');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const statusMap: Record<string, string> = { live: '🔴 LIVE', upcoming: '⏳ UPCOMING', ended: '✅ ENDED' };
        setRadarPreviews(data.slice(0, 3).map((ev: { status: string; platform: string; eventType: string; tokenSymbol: string; apr: string }) => ({
          status: ev.status === 'live' ? 'live' : ev.status === 'upcoming' ? 'upcoming' : 'hot',
          statusLabel: statusMap[ev.status] || '🔥 HOT',
          name: `${ev.platform} ${ev.eventType}`,
          token: `$${ev.tokenSymbol}`,
          apr: ev.apr ? `Est. APR: ${ev.apr}` : '',
        })));
      }
    } catch { /* use defaults */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const standardFee = volume * 0.001;
  const savings = standardFee * 0.2;

  // Animate savings number
  useEffect(() => {
    const duration = 400;
    const start = animatedSavings;
    const end = savings;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedSavings(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savings]);

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const formatCurrencyDecimal = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sliderPercent = ((volume - 1000) / (1000000 - 1000)) * 100;
  // Intensity 0..1 drives all dynamic glass effects
  const intensity = sliderPercent / 100;
  // Particle count grows with intensity
  const particleCount = Math.floor(intensity * 20);
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    })),
  []);

  return (
    <div className="so-page">
      {/* Animated background blobs */}
      <div className="so-bg-effects">
        <div className="so-blob so-blob-1" />
        <div className="so-blob so-blob-2" />
        <div className="so-blob so-blob-3" />
      </div>

      {/* Hero Section - Split Layout */}
      <section className="so-hero" style={{ paddingBottom: '80px' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: '40px' }}>
            <Link href="/" className="more-back-btn">{t('btn.backToHome')}</Link>
          </div>
          
          <div className="so-hero-split-layout">
            {/* Left Column */}
            <div className="so-hero-left">
              <div className="so-hero-badge">
                <span className="so-badge-pulse" />
                <span>🔥 {t('so.exclusivePartnerDeals')}</span>
              </div>
              <div className="so-hero-title-glass-card">
                <h1 className="so-hero-title">
                  {t('so.hero.save')} <span className="so-hero-highlight">20%</span>{t('so.hero.onEveryTrade')}
                </h1>
              </div>
              <p className="so-hero-subtitle">
                {t('so.hero.subtitle')}
              </p>
              
              <div className="so-trust-inline">
                <div className="so-trust-badge">
                  <span>🔒</span> {t('so.trust.verified')}
                </div>
                <div className="so-trust-badge">
                  <span>⚡</span> {t('so.trust.instant')}
                </div>
                <div className="so-trust-badge">
                  <span>♾️</span> {t('so.trust.lifetime')}
                </div>
              </div>
            </div>

            {/* Right Column (Calculator) */}
            <div className="so-hero-right">
              <div
                className={`so-calculator-card ${intensity > 0.5 ? 'so-calc-intense' : ''} ${intensity > 0.85 ? 'so-calc-max' : ''}`}
            style={{
              '--intensity': intensity,
              '--glow-opacity': 0.08 + intensity * 0.35,
              '--border-alpha': 0.12 + intensity * 0.3,
              '--shimmer-speed': `${4 - intensity * 2.5}s`,
              '--blur-amount': `${32 + intensity * 16}px`,
              '--saturation': `${180 + intensity * 60}%`,
              '--hue-shift': `${intensity * 30}deg`,
            } as React.CSSProperties}
          >
            {/* Dynamic glow layers */}
            <div className="so-calc-inner-glow" />
            <div className="so-calc-glass-shimmer" />
            <div className="so-calc-iridescent" />
            <div className="so-calc-aurora" />

            {/* Floating particles — appear & intensify with slider */}
            <div className="so-calc-particles" aria-hidden="true">
              {particles.slice(0, particleCount).map((p) => (
                <span
                  key={p.id}
                  className="so-calc-particle"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                    opacity: 0.3 + intensity * 0.7,
                  }}
                />
              ))}
            </div>

            {/* Pulsing ring border effect */}
            <div className="so-calc-ring" />

            <div className="so-calc-header">
              <h2>{t('so.calc.howMuch')}</h2>
              <p>{t('so.calc.dragSlider')}</p>
            </div>

            <div className="so-slider-section">
              <div className="so-slider-label-row">
                <span className="so-slider-label">{t('so.calc.monthlyVolume')}</span>
                <span className="so-slider-value" style={{
                  textShadow: intensity > 0.5 ? `0 0 ${10 + intensity * 20}px rgba(168,85,247,${0.3 + intensity * 0.4})` : 'none',
                }}>{formatCurrency(volume)}</span>
              </div>
              <div className="so-slider-track-wrapper">
                <input
                  ref={sliderRef}
                  type="range"
                  min={1000}
                  max={1000000}
                  step={1000}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="so-range-slider"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${sliderPercent}%, rgba(255,255,255,0.08) ${sliderPercent}%)`,
                  }}
                />
                <div className="so-slider-markers">
                  <span>$1K</span>
                  <span>$250K</span>
                  <span>$500K</span>
                  <span>$750K</span>
                  <span>$1M</span>
                </div>
              </div>
            </div>

            <div className="so-calc-results">
              <div className="so-calc-result-item">
                <span className="so-calc-result-label">{t('so.calc.standardFee')}</span>
                <span className="so-calc-result-value">{formatCurrencyDecimal(standardFee)}</span>
              </div>
              <div className="so-calc-divider" />
              <div className="so-calc-result-item so-calc-result-savings">
                <span className="so-calc-result-label">🎉 {t('so.calc.vipDiscount')}</span>
                <span className="so-calc-result-value so-savings-value">
                  − {formatCurrencyDecimal(standardFee * 0.2)}
                </span>
              </div>
            </div>

            <div
              className="so-savings-highlight"
              style={{
                boxShadow: intensity > 0.5
                  ? `0 0 ${20 + intensity * 40}px rgba(168,85,247,${intensity * 0.25}), inset 0 0 ${intensity * 30}px rgba(52,211,153,${intensity * 0.08})`
                  : 'none',
              }}
            >
              <div className="so-savings-highlight-glow" />
              <div className="so-savings-content">
                <div className="so-3d-coin-wrap" style={{
                  transform: `scale(${1 + intensity * 0.3})`,
                  transition: 'transform 0.4s',
                }}>
                  <div className="so-3d-coin">
                    <div className="so-3d-coin-layer" />
                    <div className="so-3d-coin-layer" />
                    <div className="so-3d-coin-layer" />
                    <div className="so-3d-coin-layer" />
                    <div className="so-3d-coin-layer" />
                    <div className="so-3d-coin-face so-3d-coin-front">₿</div>
                    <div className="so-3d-coin-face so-3d-coin-back">₿</div>
                  </div>
                </div>
                <div>
                  <div className="so-savings-label">{t('so.calc.youSave')}</div>
                  <div className="so-savings-amount" style={{
                    textShadow: `0 0 ${8 + intensity * 24}px rgba(52,211,153,${0.2 + intensity * 0.5})`,
                  }}>
                    {formatCurrencyDecimal(animatedSavings)}
                    <span className="so-savings-period">{t('so.calc.perMonth')}</span>
                  </div>
                  <div className="so-savings-yearly">
                    {t('so.calc.thats')}<strong>{formatCurrency(savings * 12)}</strong>{t('so.calc.perYear')}
                  </div>
                </div>
              </div>
            </div>

            <a href="#exchanges" className="so-cta-primary">
              <span className="so-cta-sparkle">✨</span>
              {t('so.calc.claimDiscount')}
              <span className="so-cta-arrow">→</span>
            </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Exchange Comparison Matrix — Premium */}
      <section id="exchanges" className="so-exchanges-section">
        <Container>
          {/* Floating orbs behind the exchange grid */}
          <div className="so-ex-orbs" aria-hidden="true">
            <div className="so-ex-orb so-ex-orb-1" />
            <div className="so-ex-orb so-ex-orb-2" />
            <div className="so-ex-orb so-ex-orb-3" />
          </div>

          <div className="so-section-label">
            <span className="so-section-icon">🏆</span>
            <span>{t('so.exchange.title')}</span>
          </div>
          <h2 className="so-exchanges-title">
            {t('so.exchange.topExchanges')}<span className="so-gradient-text-animated">{t('so.exchange.exclusiveRates')}</span>
          </h2>
          <p className="so-exchanges-subtitle">
            {t('so.exchange.subtitle')}
          </p>

          <div className="so-exchange-grid">
            {exchanges.map((ex, idx) => (
              <div key={ex.name} className="so-exchange-card" style={{ '--glow-color': ex.glowColor, '--card-delay': `${idx * 0.1}s` } as React.CSSProperties}>
                <div className="so-exchange-card-glow" style={{ background: `radial-gradient(ellipse at 50% 0%, ${ex.glowColor}, transparent 70%)` }} />
                <div className="so-ex-card-shimmer" />

                {/* Badge */}
                <div className="so-exchange-badge" style={{ background: ex.badgeColor, color: '#000' }}>
                  {ex.badge}
                </div>

                {/* Logo & Name */}
                <div className="so-exchange-header">
                  {ex.logo && ex.logo.startsWith('http') && ex.logo.length > 10 ? (
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#111' }}>
                      <Image src={ex.logo} alt={ex.name} fill style={{ objectFit: 'contain' }} unoptimized />
                    </div>
                  ) : (
                    <span className="so-exchange-logo">{ex.logo || '🟡'}</span>
                  )}
                  <h3 className="so-exchange-name">{ex.name}</h3>
                </div>

                {/* Bonus */}
                <div className="so-exchange-bonus">
                  <span className="so-bonus-icon">🎁</span>
                  <span className="so-bonus-text">{ex.bonus}</span>
                </div>

                {/* Features */}
                <ul className="so-exchange-features">
                  {ex.features.map((feat, i) => (
                    <li key={i}>
                      <span className="so-feature-check">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href={(() => {
                    let url = ex.link || '#';
                    // Strip accidental leading # from URLs
                    while (url.startsWith('#http')) url = url.slice(1);
                    return url;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="so-exchange-cta"
                >
                  {t('so.exchange.signUp')}
                  <span className="so-cta-arrow">→</span>
                </a>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="so-trust-section">
            <div className="so-trust-badge">
              <span>🔒</span> {t('so.trust.verified')}
            </div>
            <div className="so-trust-badge">
              <span>⚡</span> {t('so.trust.instant')}
            </div>
            <div className="so-trust-badge">
              <span>♾️</span> {t('so.trust.lifetime')}
            </div>
          </div>
        </Container>
      </section>

      {/* FOMO Tracker — Airdrop Radar Teaser — Premium */}
      <section className="so-radar-section">
        <Container>
          <div className="so-radar-card">
            <div className="so-radar-glow" />
            <div className="so-radar-scanline" />
            <div className="so-radar-header">
              {/* 3D Radar Object */}
              <div className="so-radar-3d-wrap">
                <div className="so-radar-3d">
                  <div className="so-radar-3d-core" />
                  <div className="so-radar-3d-ring so-radar-3d-ring-1" />
                  <div className="so-radar-3d-ring so-radar-3d-ring-2" />
                  <div className="so-radar-3d-ring so-radar-3d-ring-3" />
                  <div className="so-radar-3d-beam" />
                  <div className="so-radar-3d-dot so-radar-3d-dot-1" />
                  <div className="so-radar-3d-dot so-radar-3d-dot-2" />
                  <div className="so-radar-3d-dot so-radar-3d-dot-3" />
                </div>
                <span className="so-radar-ping" />
              </div>
              <div>
                <h2 className="so-radar-title">{t('so.radar.title')}</h2>
                <p className="so-radar-desc">
                  {t('so.radar.desc')}
                </p>
              </div>
            </div>

            {/* Quick preview cards */}
            <div className="so-radar-preview-grid">
              {radarPreviews.map((rp, i) => (
                <div key={i} className="so-radar-preview-card">
                  <div className={`so-radar-preview-status ${rp.status}`}>
                    {rp.status === 'live' ? `🔴 ${t('so.badge.live')}` : rp.status === 'upcoming' ? `⏳ ${t('so.badge.upcoming')}` : `🔥 ${t('so.badge.hot')}`}
                  </div>
                  <div className="so-radar-preview-name">{rp.name}</div>
                  <div className="so-radar-preview-token">{rp.token}</div>
                  <div className="so-radar-preview-apy">{rp.apr}</div>
                </div>
              ))}
            </div>

            <Link href="/crypto-events" className="so-radar-cta">
              <span>🚀</span>
              {t('so.radar.viewTracker')}
              <span className="so-cta-arrow">→</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Disclaimer */}
      <section className="so-disclaimer-section">
        <Container>
          <p className="so-disclaimer">
            <strong>Disclaimer:</strong> {t('so.disclaimer')}
          </p>
        </Container>
      </section>
    </div>
  );
}
