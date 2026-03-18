'use client';

import { useTranslation } from '@/lib/LanguageContext';

export default function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      className="lang-toggle-floating"
      onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}
      aria-label={`Switch to ${locale === 'en' ? 'Vietnamese' : 'English'}`}
      title={locale === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
    >
      <span className="lang-toggle-flag-track">
        <span className={`lang-toggle-flag ${locale === 'en' ? 'active' : ''}`}>
          🇺🇸
        </span>
        <span className={`lang-toggle-flag ${locale === 'vi' ? 'active' : ''}`}>
          🇻🇳
        </span>
        <span
          className="lang-toggle-flag-thumb"
          style={{ transform: locale === 'vi' ? 'translateX(100%)' : 'translateX(0)' }}
        />
      </span>
    </button>
  );
}
