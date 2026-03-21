'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Tweet } from 'react-tweet';
import { useTranslation } from '@/lib/LanguageContext';
import { useSwipe } from '@/hooks/useSwipe';
import { useAutoDragScroll } from '@/hooks/useAutoDragScroll';

interface EmbeddedTweetData {
    id: number;
    tweetId: string;
    label: string;
    category: string;
}

export default function TweetWall() {
    const [tweets, setTweets] = useState<EmbeddedTweetData[]>([]);
    const [filter, setFilter] = useState('all');
    const { scrollRef, setIsPaused } = useAutoDragScroll<HTMLDivElement>({ speed: 0.5, direction: 'left' });
    const { t } = useTranslation();

    useEffect(() => {
        fetch('/api/embedded-tweets')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setTweets(data); })
            .catch(() => {});
    }, []);

    const categories = ['all', ...Array.from(new Set(tweets.map(t => t.category)))];
    const filtered = filter === 'all' ? tweets : tweets.filter(tw => tw.category === filter);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        
        // PAUSE the manual requestAnimationFrame loop temporarily!
        // Otherwise, rAF will override scrollLeft instantly and cancel the smooth scrolling animation!
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 800);
        
        const cardWidth = 380;
        
        // Handling infinite loop jumps before smooth scrolling
        if (direction === 'left' && el.scrollLeft <= 5) {
             el.scrollLeft += el.scrollWidth / 2;
        } else if (direction === 'right' && el.scrollLeft >= (el.scrollWidth / 2) - 5) {
             el.scrollLeft -= el.scrollWidth / 2;
        }

        el.scrollBy({
            left: direction === 'left' ? -cardWidth : cardWidth,
            behavior: 'smooth'
        });
    };

    // Swipe left/right to scroll through tweets
    const tweetSwipeRef = useSwipe<HTMLDivElement>({
        onSwipeLeft: () => { scroll('right'); setIsPaused(true); },
        onSwipeRight: () => { scroll('left'); setIsPaused(true); },
        threshold: 40,
    });

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
                <div>
                    <h2 className="tweet-wall-title">
                        <span className="tweet-wall-x">𝕏</span>
                        {t('section.featuredPosts')}
                    </h2>
                    <p className="tweet-wall-desc">{t('tweet.curatedInsights')}</p>
                </div>
                <Link href="/tweets" className="archive-view-all-btn">
                    {t('btn.viewAllTweets')}
                </Link>
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

            <div
                className="tweet-wall-carousel-wrapper"
                ref={tweetSwipeRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
            >
                {/* Left nav button */}
                <button
                    className={`tweet-carousel-btn tweet-carousel-btn-left visible`}
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>

                {/* Scrollable tweet row with auto-scroll marquee */}
                <div
                    className="tweet-wall-grid"
                    data-theme="dark"
                    ref={scrollRef}
                >
                    <div className="tweet-marquee-track-js" style={{ display: 'flex', gap: '24px', width: 'max-content', padding: '0 16px' }}>
                        {filtered.map(tw => (
                            <div key={tw.id} className="tweet-wall-card">
                                {tw.label && <div className="tweet-wall-label">{tw.label}</div>}
                                <Tweet id={tw.tweetId} />
                            </div>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {filtered.map(tw => (
                            <div key={`dup-${tw.id}`} className="tweet-wall-card">
                                {tw.label && <div className="tweet-wall-label">{tw.label}</div>}
                                <Tweet id={tw.tweetId} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right nav button */}
                <button
                    className={`tweet-carousel-btn tweet-carousel-btn-right visible`}
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
