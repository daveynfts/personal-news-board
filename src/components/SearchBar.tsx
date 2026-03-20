'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/LanguageContext';
import { Pin, Edit3, Calendar, Search } from 'lucide-react';

interface SearchResult {
    id: number;
    title: string;
    type: 'post' | 'article' | 'event';
    subType?: string;
    url?: string;
    imageUrl?: string;
    date?: string;
    snippet?: string;
}

interface SearchBarProps {
    /** Restrict search to a specific content type */
    scope?: 'all' | 'posts' | 'articles' | 'events';
    /** Placeholder text */
    placeholder?: string;
    /** Compact mode for archive pages (smaller) */
    compact?: boolean;
    /** Client-side filter callback — called with search query for local filtering */
    onLocalFilter?: (query: string) => void;
}

export default function SearchBar({
    scope = 'all',
    placeholder,
    compact = false,
    onLocalFilter,
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
    const router = useRouter();
    const { t, locale } = useTranslation();

    // Resolve placeholder
    const resolvedPlaceholder = placeholder || (() => {
        switch (scope) {
            case 'articles': return t('search.articles');
            case 'events': return t('search.events');
            case 'posts': return t('search.picks');
            default: return t('search.everything');
        }
    })();

    // Debounced API search
    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&scope=${scope}&limit=12`);
            const data = await res.json();
            setResults(data.results || []);
            setIsOpen(true);
        } catch {
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [scope]);

    const handleInputChange = (value: string) => {
        setQuery(value);
        setSelectedIndex(-1);

        // Call local filter callback immediately (for archive page client-side filtering)
        if (onLocalFilter) {
            onLocalFilter(value);
        }

        // Debounce API call
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) {
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    navigateToResult(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const navigateToResult = (result: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        if (result.type === 'post' && result.url) {
            window.open(result.url, '_blank');
        } else if (result.type === 'article') {
            router.push(`/article/${result.id}`);
        } else if (result.type === 'event') {
            router.push('/events');
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && dropdownRef.current) {
            const items = dropdownRef.current.querySelectorAll('.search-result-item');
            items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    // Clean up debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // Group results by type
    const groupedResults = results.reduce((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {} as Record<string, SearchResult[]>);

    const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        post: { label: t('searchbar.posts'), icon: <Pin size={14} />, color: 'var(--accent-color)' },
        article: { label: t('searchbar.articles'), icon: <Edit3 size={14} />, color: 'var(--blog-color)' },
        event: { label: t('searchbar.events'), icon: <Calendar size={14} />, color: '#10b981' },
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

    let flatIndex = -1;
    const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

    return (
        <div className={`search-bar-wrapper ${compact ? 'search-compact' : ''}`}>
            <div className="search-input-container">
                <svg
                    className="search-icon"
                    width={compact ? '16' : '18'}
                    height={compact ? '16' : '18'}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder={resolvedPlaceholder}
                    value={query}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    autoComplete="off"
                    spellCheck={false}
                />
                {isLoading && (
                    <div className="search-spinner" />
                )}
                {query && !isLoading && (
                    <button
                        className="search-clear"
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                            if (onLocalFilter) onLocalFilter('');
                            inputRef.current?.focus();
                        }}
                        aria-label={t('search.clearLabel')}
                    >
                        ✕
                    </button>
                )}
                <kbd className="search-shortcut">⌘K</kbd>
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
                <div ref={dropdownRef} className="search-dropdown">
                    {Object.entries(groupedResults).map(([type, items]) => {
                        const config = typeConfig[type] || { label: type, icon: '📄', color: '#666' };
                        return (
                            <div key={type} className="search-group">
                                <div className="search-group-header">
                                    <span>{config.icon} {config.label}</span>
                                    <span className="search-group-count">{items.length}</span>
                                </div>
                                {items.map(result => {
                                    flatIndex++;
                                    const idx = flatIndex;
                                    return (
                                        <button
                                            key={`${result.type}-${result.id}`}
                                            className={`search-result-item ${idx === selectedIndex ? 'selected' : ''}`}
                                            onClick={() => navigateToResult(result)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                        >
                                            <div className="search-result-main">
                                                <div className="search-result-title">
                                                    {highlightMatch(result.title, query)}
                                                </div>
                                                {result.snippet && (
                                                    <div className="search-result-snippet">
                                                        {highlightMatch(result.snippet, query)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="search-result-meta">
                                                {result.subType && (
                                                    <span
                                                        className="search-result-badge"
                                                        style={{
                                                            background: result.subType === 'News' ? 'var(--news-color)' :
                                                                result.subType === 'X' ? 'var(--x-color)' :
                                                                    result.subType === 'Blog' ? 'var(--blog-color)' :
                                                                        'rgba(99, 102, 241, 0.15)',
                                                            color: result.subType === 'X' ? '#fff' :
                                                                result.subType === 'News' ? '#000' :
                                                                    result.subType === 'Blog' ? '#000' : '#a5b4fc',
                                                        }}
                                                    >
                                                        {result.subType}
                                                    </span>
                                                )}
                                                {result.date && (
                                                    <span className="search-result-date">
                                                        {new Date(result.date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                                <span className="search-result-arrow">→</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                    <div className="search-dropdown-footer">
                        <span>{results.length} {results.length !== 1 ? t('search.resultsPlural') : t('search.results')} {t('search.found')}</span>
                        <span className="search-nav-hint">
                            <kbd>↑</kbd><kbd>↓</kbd> {t('search.navigate')} · <kbd>↵</kbd> {t('search.open')} · <kbd>esc</kbd> {t('search.close')}
                        </span>
                    </div>
                </div>
            )}

            {/* No results state */}
            {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
                <div ref={dropdownRef} className="search-dropdown">
                    <div className="search-no-results">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'rgba(255,255,255,0.5)' }}><Search size={32} /></div>
                        <p>{t('searchbar.noResultsFor')} &quot;{query}&quot;</p>
                        <span>{t('searchbar.tryDifferent')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
