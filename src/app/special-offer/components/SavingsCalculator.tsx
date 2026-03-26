'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from '../SpecialOffer.module.css';
import LiquidPiggyBank from '@/components/LiquidPiggyBank';
import { formatCurrency, formatCurrencyDecimal } from '@/lib/formatters';
import { useTranslation } from '@/lib/LanguageContext';

export default function SavingsCalculator() {
  const { t } = useTranslation();
  const [volume, setVolume] = useState(50000);
  const [animatedSavings, setAnimatedSavings] = useState(0);
  const sliderRef = useRef<HTMLInputElement>(null);

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
    <div
      className={`${styles['so-calculator-card']} ${intensity > 0.5 ? styles['so-calc-intense'] : ''} ${intensity > 0.85 ? styles['so-calc-max'] : ''}`}
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
      <div className={`${styles['so-calc-iridescent']}`} />

      {/* Floating particles — appear & intensify with slider */}
      <div className={`${styles['so-calc-particles']}`} aria-hidden="true">
        {particles.slice(0, particleCount).map((p) => (
          <span
            key={p.id}
            className={`${styles['so-calc-particle']}`}
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
      <div className={`${styles['so-calc-ring']}`} />

      <div className={`${styles['so-calc-header']}`}>
        <h2>{t('so.calc.howMuch')}</h2>
        <p>{t('so.calc.dragSlider')}</p>
      </div>

      <div className={`${styles['so-slider-section']}`}>
        <div className={`${styles['so-slider-label-row']}`}>
          <span className={`${styles['so-slider-label']}`}>{t('so.calc.monthlyVolume')}</span>
          <span className={`${styles['so-slider-value']}`} style={{
            fontVariantNumeric: 'tabular-nums',
            textShadow: intensity > 0.5 ? `0 0 ${10 + intensity * 20}px rgba(212,175,55,${0.3 + intensity * 0.4})` : 'none',
          }}>{formatCurrency(volume)}</span>
        </div>
        <div className={`${styles['so-slider-track-wrapper']}`}>
          <input
            ref={sliderRef}
            type="range"
            min={1000}
            max={1000000}
            step={1000}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className={`${styles['so-range-slider']}`}
            style={{
              background: `linear-gradient(to right, #FBF8EA 0%, #D4AF37 ${sliderPercent}%, rgba(255,255,255,0.08) ${sliderPercent}%)`,
            }}
          />
          <div className={`${styles['so-slider-markers']}`}>
            <span>$1K</span>
            <span>$250K</span>
            <span>$500K</span>
            <span>$750K</span>
            <span>$1M</span>
          </div>
        </div>
      </div>

      <div className={`${styles['so-calc-results']}`}>
        <div className={`${styles['so-calc-result-item']}`}>
          <span className={`${styles['so-calc-result-label']}`}>{t('so.calc.standardFee')}</span>
          <span className={`${styles['so-calc-result-value']}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrencyDecimal(standardFee)}</span>
        </div>
        <div className={`${styles['so-calc-divider']}`} />
        <div className={`${styles['so-calc-result-item']} ${styles['so-calc-result-savings']}`}>
          <span className={`${styles['so-calc-result-label']} flex items-center`}>{t('so.calc.vipDiscount')}</span>
          <span className={`${styles['so-calc-result-value']} ${styles['so-savings-value']}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
            − {formatCurrencyDecimal(standardFee * 0.2)}
          </span>
        </div>
      </div>

      <div
        className={`${styles['so-savings-highlight']}`}
        style={{
          boxShadow: intensity > 0.5
            ? `0 0 ${20 + intensity * 40}px rgba(212,175,55,${intensity * 0.35}), inset 0 0 ${intensity * 30}px rgba(212,175,55,${intensity * 0.15})`
            : 'none',
        }}
      >
        <div className={`${styles['so-savings-highlight-glow']}`} />
        <div className={`${styles['so-savings-highlight-content']}`} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '24px' }}>
          {/* Premium 3D Coin Asset - AI Generated */}
          <LiquidPiggyBank 
            intensity={intensity} 
            className="flex-shrink-0" 
          />
          
          {/* Savings Text Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={`${styles['so-savings-label']}`} style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: 700 }}>
              {t('so.calc.youSave')}
            </div>
            <div className={`${styles['so-savings-amount']}`} style={{
              fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1px', color: '#fff',
              fontVariantNumeric: 'tabular-nums',
              textShadow: intensity > 0.5 ? `0 0 ${10 + intensity * 20}px rgba(212,175,55,${0.3 + intensity * 0.4})` : 'none',
              display: 'flex', alignItems: 'baseline', gap: '8px', lineHeight: 1,
              flexWrap: 'wrap'
            }}>
              <span style={{ display: 'inline-block', wordBreak: 'break-word', maxWidth: '100%' }}>{formatCurrencyDecimal(animatedSavings)}</span>
              <span className={`${styles['so-savings-period']}`} style={{ fontSize: '1.25rem', color: '#9ca3af', fontWeight: '500', whiteSpace: 'nowrap' }}>{t('so.calc.perMonth')}</span>
            </div>
            <div className={`${styles['so-savings-yearly']}`} style={{ fontSize: '0.95rem', color: '#6b7280', marginTop: '10px', wordBreak: 'break-word' }}>
              {t('so.calc.thats')} <strong style={{
                background: 'linear-gradient(135deg, #FBF8EA 0%, #D4AF37 45%, #AA7C11 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5), 0px 4px 15px rgba(212, 175, 55, 0.25)'
              }}>{formatCurrency(savings * 12)}</strong> {t('so.calc.perYear')}
            </div>
          </div>
        </div>
      </div>

      <a href="#exchanges" className={`${styles['so-cta-primary']} flex items-center justify-center`}>
        {t('so.calc.claimDiscount')}
        <span className={`${styles['so-cta-arrow']} ml-2`}>→</span>
      </a>
    </div>
  );
}
