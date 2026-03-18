'use client';

import { useState, useEffect } from 'react';
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
    const { t } = useTranslation();

    useEffect(() => {
        fetch('/api/embedded-tweets')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setTweets(data); })
            .catch(() => {});
    }, []);

    const categories = ['all', ...Array.from(new Set(tweets.map(t => t.category)))];
    const filtered = filter === 'all' ? tweets : tweets.filter(tw => tw.category === filter);

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

            <div className="tweet-wall-grid" data-theme="dark">
                {filtered.map(tw => (
                    <div key={tw.id} className="tweet-wall-card">
                        {tw.label && <div className="tweet-wall-label">{tw.label}</div>}
                        <Tweet id={tw.tweetId} />
                    </div>
                ))}
            </div>
        </section>
    );
}
