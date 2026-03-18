'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Container from './Container';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '@/lib/LanguageContext';

interface SearchResult {
    id: number;
    title: string;
    type: 'post' | 'article' | 'event';
    subType?: string;
    url?: string;
    date?: string;
    snippet?: string;
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState('/logo.png');
  const [bubbleText, setBubbleText] = useState('');
  const [floatingBubbles, setFloatingBubbles] = useState<Array<{
    id: number; text: string; x: number; y: number; size: number;
    hue: number; delay: number;
  }>>([]);
  const bubbleIdRef = useRef(0);
  const hoverTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Split bubble text into phrases for individual bubbles
  const bubblePhrases = useMemo(() => {
    if (!bubbleText) return [];
    // Split by sentences, commas, or emoji boundaries
    const parts = bubbleText.split(/(?<=[!?.🌊☕✨🚀💎👋🫶☀️])\s*|[,;]\s*/).filter(s => s.trim());
    return parts.length > 0 ? parts : [bubbleText];
  }, [bubbleText]);

  const spawnBubble = useCallback(() => {
    if (bubblePhrases.length === 0) return;
    const phrase = bubblePhrases[Math.floor(Math.random() * bubblePhrases.length)];
    const id = ++bubbleIdRef.current;
    const bubble = {
      id,
      text: phrase.trim(),
      x: 10 + Math.random() * 80, // 10%-90% viewport width
      y: 20 + Math.random() * 60, // 20%-80% viewport height
      size: 0.8 + Math.random() * 0.6, // scale 0.8-1.4
      hue: Math.floor(Math.random() * 360),
      delay: Math.random() * 0.3,
    };
    setFloatingBubbles(prev => [...prev, bubble]);
    // Auto-remove after animation
    setTimeout(() => {
      setFloatingBubbles(prev => prev.filter(b => b.id !== id));
    }, 3500);
  }, [bubblePhrases]);

  const startBubbles = useCallback(() => {
    if (bubblePhrases.length === 0) return;
    // Spawn initial burst
    for (let i = 0; i < Math.min(3, bubblePhrases.length); i++) {
      setTimeout(() => spawnBubble(), i * 200);
    }
    // Continue spawning
    hoverTimerRef.current = setInterval(spawnBubble, 1200);
  }, [spawnBubble, bubblePhrases]);

  const stopBubbles = useCallback(() => {
    if (hoverTimerRef.current) {
      clearInterval(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (hoverTimerRef.current) clearInterval(hoverTimerRef.current); };
  }, []);

  // Fetch site settings
  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
        if (data.bubbleText) setBubbleText(data.bubbleText);
      })
      .catch(() => {});
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [searchOpen]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen]);

  // Search API
  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&scope=all&limit=10`);
      const data = await res.json();
      setResults(data.results || []);
    } catch { setResults([]); }
    finally { setIsLoading(false); }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 250);
  };

  const navigateToResult = (result: SearchResult) => {
    setSearchOpen(false);
    if (result.type === 'post' && result.url) {
      window.open(result.url, '_blank');
    } else if (result.type === 'article') {
      router.push(`/article/${result.id}`);
    } else if (result.type === 'event') {
      router.push('/events');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      navigateToResult(results[selectedIndex]);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const typeConfig: Record<string, { icon: string; color: string }> = {
    post: { icon: '📌', color: 'var(--accent-color)' },
    article: { icon: '✍️', color: 'var(--blog-color)' },
    event: { icon: '📅', color: '#10b981' },
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q || q.length < 2) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="search-highlight">{part}</mark>
        : part
    );
  };

  return (
    <>
      <div className="header-row">
        <LanguageToggle />
        <header className="app-header">
          <Container className="header-inner">
            <div className="logo">
              <div
                className="logo-icon-wrapper"
                onMouseEnter={startBubbles}
                onMouseLeave={stopBubbles}
              >
                <div className="logo-icon">
                  <a href="https://x.com/DaveyNFTs_" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
                    <Image src={avatarUrl} alt="Board Logo" fill style={{ objectFit: 'cover', borderRadius: 'inherit' }} unoptimized />
                  </a>
                </div>
              </div>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1>DaveyNFTs</h1>
              </Link>
            </div>
            <nav className="main-nav">
              <Link href="/special-offer" className="nav-link nav-link-special">
                <span className="nav-special-icon">✨</span>
                {t('nav.specialOffer')}
              </Link>
              <button
                className="header-search-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                title="Search (⌘K)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </nav>
          </Container>
        </header>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setSearchOpen(false);
        }}>
          <div className="search-overlay-content">
            <div className="search-overlay-input-wrap">
              <svg className="search-overlay-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                className="search-overlay-input"
                placeholder={t('search.placeholder')}
                value={query}
                onChange={e => handleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              {isLoading && <div className="search-spinner" style={{ right: '52px' }} />}
              <kbd className="search-overlay-kbd" onClick={() => setSearchOpen(false)}>ESC</kbd>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="search-overlay-results">
                {results.map((result, index) => {
                  const config = typeConfig[result.type] || { icon: '📄', color: '#666' };
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      className={`search-overlay-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => navigateToResult(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className="search-overlay-item-icon">{config.icon}</span>
                      <div className="search-overlay-item-body">
                        <div className="search-overlay-item-title">
                          {highlightMatch(result.title, query)}
                        </div>
                        {result.snippet && (
                          <div className="search-overlay-item-snippet">
                            {highlightMatch(result.snippet, query)}
                          </div>
                        )}
                      </div>
                      <div className="search-overlay-item-meta">
                        {result.subType && (
                          <span className="search-result-badge" style={{
                            background: result.subType === 'News' ? 'var(--news-color)' :
                              result.subType === 'X' ? 'var(--x-color)' :
                                result.subType === 'Blog' ? 'var(--blog-color)' :
                                  'rgba(99, 102, 241, 0.15)',
                            color: result.subType === 'X' ? '#fff' :
                              result.subType === 'News' ? '#000' :
                                result.subType === 'Blog' ? '#000' : '#a5b4fc',
                          }}>{result.subType}</span>
                        )}
                        <span className="search-overlay-item-arrow">→</span>
                      </div>
                    </button>
                  );
                })}
                <div className="search-overlay-footer">
                  <span>{results.length} {results.length !== 1 ? t('search.resultsPlural') : t('search.results')}</span>
                  <span className="search-nav-hint">
                    <kbd>↑</kbd><kbd>↓</kbd> {t('search.navigate')} · <kbd>↵</kbd> {t('search.open')}
                  </span>
                </div>
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && results.length === 0 && !isLoading && (
              <div className="search-overlay-results">
                <div className="search-no-results">
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                  <p>{t('search.noResults')} &quot;{query}&quot;</p>
                  <span>{t('search.tryDifferent')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bubbles Portal */}
      {floatingBubbles.length > 0 && (
        <div className="floating-bubbles-portal">
          {floatingBubbles.map(bubble => (
            <div
              key={bubble.id}
              className="floating-bubble"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                transform: `scale(${bubble.size})`,
                animationDelay: `${bubble.delay}s`,
                '--bubble-hue': bubble.hue,
              } as React.CSSProperties}
            >
              <span>{bubble.text}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
