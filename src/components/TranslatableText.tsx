'use client';

import { useTranslation } from '@/lib/LanguageContext';

/** Translatable hero text (used when no events) */
export function HeroText() {
  const { t } = useTranslation();
  return (
    <>
      <h2>{t('hero.title')}</h2>
      <p>{t('hero.subtitle')}</p>
    </>
  );
}

/** Translatable section header with optional view-all link */
export function SectionHeader({ 
  titleKey, 
  viewAllKey, 
  viewAllHref 
}: { titleKey: string; viewAllKey?: string; viewAllHref?: string }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
      <h2 className="section-title" style={{ marginBottom: 0 }}>{t(titleKey)}</h2>
      {viewAllKey && viewAllHref && (
        <a href={viewAllHref} className="archive-view-all-btn">{t(viewAllKey)}</a>
      )}
    </div>
  );
}

/** Translatable type tag label */
export function TypeTag({ label }: { label: string }) {
  const { t } = useTranslation();
  const key = `type.${label.toLowerCase()}`;
  // If no translation key exists, fall back to original label
  return <>{t(key) || label}</>;
}

/** Translatable empty state */
export function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" />
      </svg>
      <p>{t('empty.noPosts')} <br />{t('empty.addMagic')}</p>
    </div>
  );
}

/** Inline translatable text for Server Components */
export function Tr({ i18nKey, vars }: { i18nKey: string; vars?: Record<string, string> }) {
  const { t } = useTranslation();
  return <>{t(i18nKey, vars)}</>;
}
