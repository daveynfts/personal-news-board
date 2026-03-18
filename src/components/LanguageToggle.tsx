'use client';

import { useTranslation } from '@/lib/LanguageContext';

export default function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <button
      className="lang-toggle"
      onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}
      aria-label={`Switch to ${locale === 'en' ? 'Vietnamese' : 'English'}`}
      title={`Switch to ${locale === 'en' ? 'Tiếng Việt' : 'English'}`}
    >
      <span className="lang-toggle-track">
        <span className={`lang-toggle-option ${locale === 'en' ? 'active' : ''}`}>
          {t('lang.en')}
        </span>
        <span className={`lang-toggle-option ${locale === 'vi' ? 'active' : ''}`}>
          {t('lang.vi')}
        </span>
        <span
          className="lang-toggle-thumb"
          style={{ transform: locale === 'vi' ? 'translateX(100%)' : 'translateX(0)' }}
        />
      </span>
    </button>
  );
}
