'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Post } from '@/lib/db';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop';

export default function PostCard({ post }: { post: Post }) {
    const isX = post.type === 'X';
    const isNews = post.type === 'News';
    const typeColor = isX ? 'var(--x-color)' : isNews ? 'var(--news-color)' : 'var(--blog-color)';

    // Fallback image if none provided
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [post.imageUrl]);

    const displayImg = !imgError && post.imageUrl ? post.imageUrl : FALLBACK_IMAGE;

    return (
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-card">
            <div className="post-card-media" style={{ position: 'relative' }}>
                <div className="type-tag" style={{ backgroundColor: typeColor }}>
                    {post.type}
                </div>
                <Image
                    src={displayImg}
                    alt={post.title}
                    fill
                    className="post-image"
                    style={{ objectFit: 'cover' }}
                    onError={() => setImgError(true)}
                />
            </div>
            <div className="post-card-body">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-footer">
                    <span className="post-date">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'Syncing...'}
                    </span>
                    <span className="read-more">
                        ACCESS SOURCE
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    );
}
