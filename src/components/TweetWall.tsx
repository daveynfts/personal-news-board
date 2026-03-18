'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Tweet } from 'react-tweet';
import { useTranslation } from '@/lib/LanguageContext';

interface EmbeddedTweetData {
    id: number;
    tweetId: string;
    label: string;
    category: string;
}

export default function TweetWall() {
    const [tweets, setTweets] = useState<EmbeddedTweetData[]>([]);
    const [filter, setFilter] = useState('all');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        fetch('/api/embedded-tweets')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setTweets(data); })
            .catch(() => {});
    }, []);

    const categories = ['all', ...Array.from(new Set(tweets.map(t => t.category)))];
    const filtered = filter === 'all' ? tweets : tweets.filter(tw => tw.category === filter);

    // Check scroll boundaries
    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 5);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        // Initial check after tweets render
        const timer = setTimeout(checkScroll, 500);
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        return () => {
            clearTimeout(timer);
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [checkScroll, filtered.length]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = 380; // approximate card width + gap
        el.scrollBy({
            left: direction === 'left' ? -cardWidth : cardWidth,
            behavior: 'smooth'
        });
    };

    if (tweets.length === 0) return null;

    const categoryLabels: Record<string, string> = {
        all: t('tweet.all'),
        general: t('tweet.general'),
        breaking: t('tweet.breaking'),
        analysis: t('tweet.analysis'),
        alpha: t('tweet.alpha'),
        thread: t('tweet.thread'),
    };

    return (
        <section className="tweet-wall-section">
            <div className="tweet-wall-header">
                <h2 className="tweet-wall-title">
                    <span className="tweet-wall-x">𝕏</span>
                    {t('section.featuredPosts')}
                </h2>
                <p className="tweet-wall-desc">{t('tweet.curatedInsights')}</p>
            </div>

            {categories.length > 2 && (
                <div className="tweet-wall-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`tweet-filter-btn ${filter === cat ? 'active' : ''}`}
                        >
                            {categoryLabels[cat] || cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="tweet-wall-carousel-wrapper">
                {/* Left nav button */}
                <button
                    className={`tweet-carousel-btn tweet-carousel-btn-left ${canScrollLeft ? 'visible' : ''}`}
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>

                {/* Scrollable tweet row */}
                <div className="tweet-wall-grid" data-theme="dark" ref={scrollRef}>
                    {filtered.map(tw => (
                        <div key={tw.id} className="tweet-wall-card">
                            {tw.label && <div className="tweet-wall-label">{tw.label}</div>}
                            <Tweet id={tw.tweetId} />
                        </div>
                    ))}
                </div>

                {/* Right nav button */}
                <button
                    className={`tweet-carousel-btn tweet-carousel-btn-right ${canScrollRight ? 'visible' : ''}`}
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>
        </section>
    );
}
