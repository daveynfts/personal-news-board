import React from 'react';
import styles from '../SpecialOffer.module.css';

interface RadarPreviewData {
  status: 'live' | 'upcoming' | 'hot';
  statusLabel: string;
  name: string;
  token: string;
  apr: string;
}

interface RadarPreviewCardProps {
  rp: RadarPreviewData;
  t: (key: string) => string;
}

export default function RadarPreviewCard({ rp, t }: RadarPreviewCardProps) {
  return (
    <div className={`${styles['so-radar-preview-card']}`}>
      <div className={`${styles['so-radar-preview-status']} ${styles[rp.status] || rp.status}`}>
        {rp.status === 'live' 
          ? t('so.badge.live') 
          : rp.status === 'upcoming' 
            ? t('so.badge.upcoming') 
            : t('so.badge.hot')}
      </div>
      <div className={`${styles['so-radar-preview-name']}`}>{rp.name}</div>
      <div className={`${styles['so-radar-preview-token']}`}>{rp.token}</div>
      <div className={`${styles['so-radar-preview-apy']}`}>{rp.apr}</div>
    </div>
  );
}
