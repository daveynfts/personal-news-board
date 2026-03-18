'use client';

import { useState } from 'react';
import { Tweet } from 'react-tweet';
import Link from 'next/link';

interface TweetData {
    id: number;
    tweetId: string;
    label: string;
    category: string;
}

export default function TweetArchiveGrid({ tweets }: { tweets: TweetData[] }) {
    const [filter, setFilter] = useState('all');

    const categories = ['all', ...Array.from(new Set(tweets.map(t => t.category)))];
    const filtered = filter === 'all' ? tweets : tweets.filter(tw => tw.category === filter);

    const categoryLabels: Record<string, string> = {
        all: '🌐 All',
        general: '📌 General',
        breaking: '🔥 Breaking',
        analysis: '📊 Analysis',
        alpha: '💎 Alpha',
        thread: '🧵 Thread',
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <Link href="/" className="archive-view-all-btn" style={{ opacity: 0.7, fontSize: '0.85rem' }}>
                    ← Back to Home
                </Link>
            </div>

            {categories.length > 2 && (
                <div className="tweet-wall-filters" style={{ marginBottom: '40px', justifyContent: 'center' }}>
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

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px', opacity: 0.5 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>𝕏</div>
                    <p style={{ color: 'var(--text-secondary)' }}>No posts found.</p>
                </div>
            ) : (
                <div className="tweet-archive-grid" data-theme="dark">
                    {filtered.map(tw => (
                        <div key={tw.id} className="tweet-wall-card">
                            {tw.label && <div className="tweet-wall-label">{tw.label}</div>}
                            <Tweet id={tw.tweetId} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
