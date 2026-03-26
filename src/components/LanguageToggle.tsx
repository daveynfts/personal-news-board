'use client';

import { useTranslation } from '@/lib/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}
      aria-label={`Switch to ${locale === 'en' ? 'Vietnamese' : 'English'}`}
      title={locale === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
      className="text-gray-400 hover:text-white transition-colors duration-200"
      style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px',
        background: 'transparent', border: 'none', cursor: 'pointer', margin: 0, padding: 0
      }}
    >
      <Globe size={18} strokeWidth={2} />
    </button>
  );
}
