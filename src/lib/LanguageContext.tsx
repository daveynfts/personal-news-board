'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Locale } from './i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('daveynfts-locale') as Locale | null;
    if (stored && (stored === 'en' || stored === 'vi')) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('daveynfts-locale', newLocale);
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string>) => {
    let value = translations[locale]?.[key] || translations.en[key] || key;
    // Simple variable interpolation: {varName}
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }
    return value;
  }, [locale]);

  // Prevent hydration mismatch — render English until mounted
  const contextValue: LanguageContextType = {
    locale: mounted ? locale : 'en',
    setLocale,
    t: mounted ? t : (key: string) => translations.en[key] || key,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
