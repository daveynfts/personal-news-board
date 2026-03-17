'use client';

import { useState, useEffect } from 'react';
import { Tweet } from 'react-tweet';

interface EmbeddedTweetData {
    id: number;
    tweetId: string;
    label: string;
    category: string;
}

export default function TweetWall() {
    const [tweets, setTweets] = useState<EmbeddedTweetData[]>([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch('/api/embedded-tweets')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setTweets(data); })
            .catch(() => {});
    }, []);

    const categories = ['all', ...Array.from(new Set(tweets.map(t => t.category)))];
    const filtered = filter === 'all' ? tweets : tweets.filter(t => t.category === filter);

    if (tweets.length === 0) return null;

    const categoryLabels: Record<string, string> = {
        all: '🌐 All',
        general: '📌 General',
        breaking: '🔥 Breaking',
        analysis: '📊 Analysis',
        alpha: '💎 Alpha',
        thread: '🧵 Thread',
    };

    return (
        <section className="tweet-wall-section">
            <div className="tweet-wall-header">
                <h2 className="tweet-wall-title">
                    <span className="tweet-wall-x">𝕏</span>
                    Featured Posts
                </h2>
                <p className="tweet-wall-desc">Curated insights from the crypto community</p>
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
                {filtered.map(t => (
                    <div key={t.id} className="tweet-wall-card">
                        {t.label && <div className="tweet-wall-label">{t.label}</div>}
                        <Tweet id={t.tweetId} />
                    </div>
                ))}
            </div>
        </section>
    );
}
