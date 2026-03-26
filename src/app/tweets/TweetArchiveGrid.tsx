'use client';

import { useState } from 'react';
import { Tweet } from 'react-tweet';
import Link from 'next/link';
import { Globe, Pin, Flame, BarChart2, Diamond, List, X } from 'lucide-react';

interface TweetData {
    id: string | number;
    tweetId: string;
    label: string;
    category: string;
}

export default function TweetArchiveGrid({ tweets }: { tweets: TweetData[] }) {
    const [filter, setFilter] = useState('all');

    const categories = ['all', ...Array.from(new Set(tweets.map(t => t.category)))];
    const filtered = filter === 'all' ? tweets : tweets.filter(tw => tw.category === filter);

    const categoryLabels: Record<string, string> = {
        all: 'All',
        general: 'General',
        breaking: 'Breaking',
        analysis: 'Analysis',
        alpha: 'Alpha',
        thread: 'Thread',
    };

    const CategoryIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'all': return <Globe size={14} className="mr-1.5 inline-block text-gray-300" />;
            case 'general': return <Pin size={14} className="mr-1.5 inline-block text-accent-color" />;
            case 'breaking': return <Flame size={14} className="mr-1.5 inline-block text-orange-500" />;
            case 'analysis': return <BarChart2 size={14} className="mr-1.5 inline-block text-purple-400" />;
            case 'alpha': return <Diamond size={14} className="mr-1.5 inline-block text-blue-400" />;
            case 'thread': return <List size={14} className="mr-1.5 inline-block text-gray-400" />;
            default: return null;
        }
    };

    return (
        <div>

            {categories.length > 2 && (
                <div className="flex flex-wrap justify-center gap-3 mb-10 w-full" style={{ maxWidth: '800px', margin: '0 auto 40px auto' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`tweet-filter-btn ${filter === cat ? 'active' : ''}`}
                            style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}
                        >
                            <CategoryIcon type={cat} /> {categoryLabels[cat] || cat}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', opacity: 0.5 }}>
                    <X size={48} className="text-gray-500 mb-4" />
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
