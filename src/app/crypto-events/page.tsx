'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Container from '@/components/Container';

/* ───────────────────── Types ───────────────────── */
interface CryptoEvent {
  id: string;
  platform: string;
  platformIcon: string;
  platformColor: string;
  type: 'Launchpool' | 'Megadrop' | 'Airdrop' | 'Launchpad' | 'IDO';
  tokenName: string;
  tokenSymbol: string;
  description: string;
  totalRewards: string;
  stakingAssets: string[];
  estAPR?: string;
  startDate: string;
  endDate: string;
  status: 'live' | 'upcoming' | 'ended';
  link: string;
  tags: string[];
}

/* ───────────────────── Fallback Data (when Sanity is empty) ───────────────────── */
const FALLBACK_EVENTS: CryptoEvent[] = [
  {
    id: '1',
    platform: 'Binance',
    platformIcon: '🟡',
    platformColor: '#f0b90b',
    type: 'Launchpool',
    tokenName: 'KernelDAO',
    tokenSymbol: 'KERNEL',
    description: 'Stake BNB, FDUSD or USDC to farm KERNEL tokens. KernelDAO is building restaking infrastructure for BNB Chain.',
    totalRewards: '40,000,000 KERNEL',
    stakingAssets: ['BNB', 'FDUSD', 'USDC'],
    estAPR: '~45%',
    startDate: '2026-03-15T00:00:00Z',
    endDate: '2026-03-25T00:00:00Z',
    status: 'live',
    link: '#',
    tags: ['Hot', 'BNB Chain', 'Restaking'],
  },
  {
    id: '2',
    platform: 'Binance',
    platformIcon: '🟡',
    platformColor: '#f0b90b',
    type: 'Megadrop',
    tokenName: 'Solv Protocol',
    tokenSymbol: 'SOLV',
    description: 'Complete Web3 quests and lock BNB to earn SOLV tokens. Solv Protocol is a DeFi yield aggregator.',
    totalRewards: '588,000,000 SOLV',
    stakingAssets: ['BNB (Locked)'],
    startDate: '2026-03-20T00:00:00Z',
    endDate: '2026-04-03T00:00:00Z',
    status: 'upcoming',
    link: '#',
    tags: ['Megadrop', 'DeFi', 'Web3 Quest'],
  },
  {
    id: '3',
    platform: 'Bybit',
    platformIcon: '🟠',
    platformColor: '#f7a600',
    type: 'Launchpool',
    tokenName: 'Initia',
    tokenSymbol: 'INIT',
    description: 'Stake MNT or USDT to earn INIT tokens. Initia is a Move-based omnichain rollup platform.',
    totalRewards: '20,000,000 INIT',
    stakingAssets: ['MNT', 'USDT'],
    estAPR: '~32%',
    startDate: '2026-03-18T00:00:00Z',
    endDate: '2026-03-28T00:00:00Z',
    status: 'live',
    link: '#',
    tags: ['Move', 'Layer 1', 'Omnichain'],
  },
  {
    id: '4',
    platform: 'Binance',
    platformIcon: '🟡',
    platformColor: '#f0b90b',
    type: 'Launchpool',
    tokenName: 'Story Protocol',
    tokenSymbol: 'IP',
    description: 'Farm IP tokens by staking BNB or FDUSD. Story Protocol is building the IP layer of the internet.',
    totalRewards: '250,000,000 IP',
    stakingAssets: ['BNB', 'FDUSD'],
    estAPR: '~28%',
    startDate: '2026-03-28T00:00:00Z',
    endDate: '2026-04-07T00:00:00Z',
    status: 'upcoming',
    link: '#',
    tags: ['IP', 'Layer 1', 'Narrative'],
  },
  {
    id: '5',
    platform: 'OKX',
    platformIcon: '🟢',
    platformColor: '#00d4aa',
    type: 'Airdrop',
    tokenName: 'ZKsync',
    tokenSymbol: 'ZK',
    description: 'OKX Jumpstart Airdrop for ZKsync — hold OKB and complete trading tasks to qualify.',
    totalRewards: '100,000,000 ZK',
    stakingAssets: ['OKB'],
    startDate: '2026-04-01T00:00:00Z',
    endDate: '2026-04-15T00:00:00Z',
    status: 'upcoming',
    link: '#',
    tags: ['ZK Rollup', 'Layer 2', 'Airdrop'],
  },
  {
    id: '6',
    platform: 'Binance',
    platformIcon: '🟡',
    platformColor: '#f0b90b',
    type: 'Launchpool',
    tokenName: 'Movement',
    tokenSymbol: 'MOVE',
    description: 'Movement Network — a Move-based Layer 2 for Ethereum. Stake BNB or FDUSD to farm.',
    totalRewards: '200,000,000 MOVE',
    stakingAssets: ['BNB', 'FDUSD'],
    estAPR: '~38%',
    startDate: '2026-03-10T00:00:00Z',
    endDate: '2026-03-16T00:00:00Z',
    status: 'ended',
    link: '#',
    tags: ['Move', 'Layer 2', 'Ethereum'],
  },
];

/* ───────────────────── Component ───────────────────── */
export default function CryptoEventsPage() {
  const [events, setEvents] = useState<CryptoEvent[]>(FALLBACK_EVENTS);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  const [now, setNow] = useState(new Date());
  const [dataSource, setDataSource] = useState<'fallback' | 'sanity'>('fallback');

  // Fetch from Sanity API — fall back to mock if empty
  useEffect(() => {
    fetch('/api/crypto-events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
          setDataSource('sanity');
        }
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = useCallback((targetDate: string) => {
    const diff = new Date(targetDate).getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  }, [now]);

  const filtered = events.filter(e => filter === 'all' || e.status === filter);
  const liveCount = events.filter(e => e.status === 'live').length;
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const endedCount = events.filter(e => e.status === 'ended').length;

  return (
    <div className="ce-page">
      {/* BG Effects */}
      <div className="ce-bg-effects">
        <div className="ce-blob ce-blob-1" />
        <div className="ce-blob ce-blob-2" />
        <div className="ce-blob ce-blob-3" />
      </div>

      {/* Hero */}
      <section className="ce-hero">
        <Container>
          <div className="ce-hero-content">
            <Link href="/special-offer" className="more-back-btn">← Back to Special Offer</Link>
            <div className="ce-hero-badge">
              <span className="ce-radar-ping" />
              <span>📡 FOMO TRACKER</span>
            </div>
            <h1 className="ce-hero-title">
              Airdrop <span className="so-gradient-text">Radar</span>
            </h1>
            <p className="ce-hero-subtitle">
              Track the hottest Launchpool, Megadrop, Airdrop &amp; IDO events in real-time.
              Never miss free tokens — everything updated continuously.
            </p>

            {/* Live stats */}
            <div className="ce-live-stats">
              <div className="ce-live-stat">
                <span className="ce-live-dot live" />
                <span className="ce-live-num">{liveCount}</span>
                <span className="ce-live-label">Active</span>
              </div>
              <div className="ce-live-stat-sep" />
              <div className="ce-live-stat">
                <span className="ce-live-dot upcoming" />
                <span className="ce-live-num">{upcomingCount}</span>
                <span className="ce-live-label">Upcoming</span>
              </div>
              <div className="ce-live-stat-sep" />
              <div className="ce-live-stat">
                <span className="ce-live-dot ended" />
                <span className="ce-live-num">{endedCount}</span>
                <span className="ce-live-label">Ended</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Filter Bar */}
      <Container>
        <div className="ce-filter-bar">
          {(['all', 'live', 'upcoming', 'ended'] as const).map((f) => (
            <button
              key={f}
              className={`ce-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' && 'All Events'}
              {f === 'live' && '🔴 Live Now'}
              {f === 'upcoming' && '⏳ Upcoming'}
              {f === 'ended' && '✅ Ended'}
            </button>
          ))}
        </div>
      </Container>

      {/* Event Cards */}
      <section className="ce-events-section">
        <Container>
          <div className="ce-events-grid">
            {filtered.map((event) => {
              const countdown = event.status === 'live'
                ? getCountdown(event.endDate)
                : event.status === 'upcoming'
                  ? getCountdown(event.startDate)
                  : null;

              return (
                <div
                  key={event.id}
                  className={`ce-event-card ce-status-${event.status}`}
                  style={{ '--platform-color': event.platformColor } as React.CSSProperties}
                >
                  <div className="ce-card-glow" />

                  {/* Card Header */}
                  <div className="ce-card-top">
                    <div className="ce-card-platform">
                      <span className="ce-platform-icon">{event.platformIcon}</span>
                      <span className="ce-platform-name">{event.platform}</span>
                      <span className="ce-card-type-badge">{event.type}</span>
                    </div>
                    <div className={`ce-status-badge ${event.status}`}>
                      {event.status === 'live' && '🔴 LIVE'}
                      {event.status === 'upcoming' && '⏳ UPCOMING'}
                      {event.status === 'ended' && '✅ ENDED'}
                    </div>
                  </div>

                  {/* Token Info */}
                  <div className="ce-token-info">
                    <div className="ce-token-symbol">${event.tokenSymbol}</div>
                    <div className="ce-token-name">{event.tokenName}</div>
                  </div>

                  <p className="ce-card-desc">{event.description}</p>

                  {/* Countdown Timer */}
                  {countdown && !countdown.expired && (
                    <div className="ce-countdown-section">
                      <div className="ce-countdown-label">
                        {event.status === 'live' ? '⏰ Ends in' : '🚀 Starts in'}
                      </div>
                      <div className="ce-countdown-grid">
                        <div className="ce-countdown-unit">
                          <span className="ce-countdown-num">{String(countdown.days).padStart(2, '0')}</span>
                          <span className="ce-countdown-text">Days</span>
                        </div>
                        <span className="ce-countdown-sep">:</span>
                        <div className="ce-countdown-unit">
                          <span className="ce-countdown-num">{String(countdown.hours).padStart(2, '0')}</span>
                          <span className="ce-countdown-text">Hrs</span>
                        </div>
                        <span className="ce-countdown-sep">:</span>
                        <div className="ce-countdown-unit">
                          <span className="ce-countdown-num">{String(countdown.minutes).padStart(2, '0')}</span>
                          <span className="ce-countdown-text">Min</span>
                        </div>
                        <span className="ce-countdown-sep">:</span>
                        <div className="ce-countdown-unit">
                          <span className="ce-countdown-num ce-seconds">{String(countdown.seconds).padStart(2, '0')}</span>
                          <span className="ce-countdown-text">Sec</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {event.status === 'ended' && (
                    <div className="ce-ended-overlay">
                      <span>This event has ended</span>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="ce-details-grid">
                    <div className="ce-detail-item">
                      <span className="ce-detail-label">Total Rewards</span>
                      <span className="ce-detail-value">{event.totalRewards}</span>
                    </div>
                    <div className="ce-detail-item">
                      <span className="ce-detail-label">Stake</span>
                      <div className="ce-staking-tags">
                        {event.stakingAssets.map((a, i) => (
                          <span key={i} className="ce-staking-tag">{a}</span>
                        ))}
                      </div>
                    </div>
                    {event.estAPR && (
                      <div className="ce-detail-item">
                        <span className="ce-detail-label">Est. APR</span>
                        <span className="ce-detail-value ce-apr-value">{event.estAPR}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="ce-tags">
                    {event.tags.map((tag, i) => (
                      <span key={i} className="ce-tag">{tag}</span>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ce-card-cta"
                    style={{ background: `linear-gradient(135deg, ${event.platformColor}, ${event.platformColor}cc)` }}
                  >
                    {event.status === 'ended' ? 'View Details' : 'Join Now'}
                    <span className="so-cta-arrow">→</span>
                  </a>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="ce-empty">
              <span style={{ fontSize: '3rem' }}>🔭</span>
              <h3>No events found</h3>
              <p>Try changing the filter to view other events.</p>
            </div>
          )}
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="ce-bottom-cta-section">
        <Container>
          <div className="ce-bottom-cta-card">
            <h3>Never miss a drop.</h3>
            <p>Follow DaveyNFTs on X for instant alerts on every new Launchpool and Airdrop.</p>
            <div className="ce-bottom-cta-actions">
              <a href="https://x.com/DaveyNFTs_" target="_blank" rel="noopener noreferrer" className="ce-follow-btn">
                <span>𝕏</span> Follow @DaveyNFTs_
              </a>
              <Link href="/special-offer" className="ce-back-link">
                ← Back to Special Offer
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
