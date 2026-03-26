import React from 'react';
import Image from 'next/image';
import { Crown } from 'lucide-react';
import styles from '../SpecialOffer.module.css';

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

interface ExchangeCardProps {
  ex: ExchangeData;
  idx: number;
  t: (key: string) => string;
}

export default function ExchangeCard({ ex, idx, t }: ExchangeCardProps) {
  // Strip accidental leading # from URLs if present
  let url = ex.link || '#';
  while (url.startsWith('#http')) {
    url = url.slice(1);
  }

  return (
    <div 
      className={`${styles['so-exchange-card']}`} 
      style={{ '--glow-color': ex.glowColor, '--card-delay': `${idx * 0.1}s` } as React.CSSProperties}
    >
      <div 
        className={`${styles['so-exchange-card-glow']}`} 
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${ex.glowColor}, transparent 70%)` }} 
      />
      <div className={`${styles['so-ex-card-shimmer']}`} />

      {/* Badge */}
      <div className={`${styles['so-exchange-badge']}`} style={{ background: ex.badgeColor, color: '#000' }}>
        {ex.badge}
      </div>

      {/* Logo & Name */}
      <div className={`${styles['so-exchange-header']}`}>
        {ex.logo && ex.logo.startsWith('http') && ex.logo.length > 10 ? (
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#111' }}>
            <Image src={ex.logo} alt={ex.name} fill style={{ objectFit: 'contain' }} />
          </div>
        ) : (
          <span className={`${styles['so-exchange-logo']}`}></span>
        )}
        <h3 className={`${styles['so-exchange-name']}`}>{ex.name}</h3>
      </div>

      {/* Bonus */}
      <div className={`${styles['so-exchange-bonus']} flex items-center`}>
        <span className={`${styles['so-bonus-text']}`}>{ex.bonus}</span>
      </div>

      {/* Features */}
      <ul className={`${styles['so-exchange-features']}`}>
        {ex.features.map((feat, i) => (
          <li key={i}>
            <span className={`${styles['so-medal-badge']}`}>
              <Crown size={14} strokeWidth={2.5} />
            </span>
            {feat}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles['so-exchange-cta']}`}
      >
        {t('so.exchange.signUp')}
        <span className={`${styles['so-cta-arrow']}`}>→</span>
      </a>
    </div>
  );
}
