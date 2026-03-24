'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Post } from '@/lib/db';
import { useTranslation } from '@/lib/LanguageContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop';

function isValidImageUrl(url?: string): boolean {
    if (!url || !url.startsWith('http')) return false;
    const nonImagePatterns = [
        /^https?:\/\/(www\.)?x\.com\/[^/]+\/(photo|status)/,
        /^https?:\/\/(www\.)?twitter\.com\/[^/]+\/(photo|status)/,
    ];
    return !nonImagePatterns.some(p => p.test(url));
}

export default function PostCard({ post }: { post: Post }) {
    const isResearch = post.type?.toLowerCase() === 'research' || post.type?.toLowerCase() === 'news';
    const { t, locale } = useTranslation();
    const [imgError, setImgError] = useState(false);

    // eslint-disable-next-line
    useEffect(() => { setImgError(false); }, [post.imageUrl]);

    const hasValidImage = !imgError && isValidImageUrl(post.imageUrl);
    const displayImg = hasValidImage ? post.imageUrl! : FALLBACK_IMAGE;
    const dateLocale = locale === 'vi' ? 'vi-VN' : undefined;

    return (
        <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="dd-card"
        >
            {/* Floating Label Badge */}
            <span className={`dd-card-badge ${isResearch ? 'dd-badge-research' : 'dd-badge-article'}`}>
                {isResearch ? t('filter.news') : t('filter.blog')}
            </span>

            {/* Cover Image */}
            <div className="dd-card-cover">
                <Image
                    src={displayImg}
                    alt={post.title}
                    fill
                    className="dd-card-img"
                    onError={() => setImgError(true)}
                />
                <div className="dd-card-cover-overlay" />
            </div>

            {/* Content */}
            <div className="dd-card-content">
                <h3 className="dd-card-title">{post.title}</h3>
                <div className="dd-card-footer">
                    <time className="dd-card-date">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString(dateLocale, {
                            month: 'short', day: 'numeric', year: 'numeric'
                        }) : t('post.syncing')}
                    </time>
                    <span className="dd-card-cta">
                        {t('btn.accessSource')}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    );
}
