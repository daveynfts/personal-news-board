'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Post } from '@/lib/db';
import { useTranslation } from '@/lib/LanguageContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop';

// Check if a URL looks like a valid image source (not a social media page URL)
function isValidImageUrl(url?: string): boolean {
    if (!url || !url.startsWith('http')) return false;
    // Reject common non-image URLs (social media profile/page links)
    const nonImagePatterns = [
        /^https?:\/\/(www\.)?x\.com\/[^/]+\/(photo|status)/,
        /^https?:\/\/(www\.)?twitter\.com\/[^/]+\/(photo|status)/,
    ];
    if (nonImagePatterns.some(p => p.test(url))) return false;
    return true;
}

export default function PostCard({ post }: { post: Post }) {
    const isNews = post.type?.toLowerCase() === 'research' || post.type?.toLowerCase() === 'news';
    const typeColor = isNews ? 'var(--news-color)' : 'var(--blog-color)';
    const { t, locale } = useTranslation();

    // Fallback image if none provided
    const [imgError, setImgError] = useState(false);
    
    // Reset error state when imageUrl changes
    useEffect(() => {
        setImgError(false);
    }, [post.imageUrl]);

    const hasValidImage = !imgError && isValidImageUrl(post.imageUrl);
    const displayImg = hasValidImage ? post.imageUrl! : FALLBACK_IMAGE;

    const dateLocale = locale === 'vi' ? 'vi-VN' : undefined;

    return (
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-card-wrapper block relative group" style={{ width: '320px', height: '100%', flexShrink: 0 }}>
            <style dangerouslySetInnerHTML={{__html: `
                .post-card-wrapper:hover .post-card-label {
                    transform: translateY(-8px) scale(1.03);
                }
                .post-card-wrapper:hover .post-card {
                    transform: translateY(-8px) scale(1.03);
                }
                .post-card-wrapper:hover .post-image {
                    transform: scale(1.1);
                }
                .post-card-wrapper:hover .read-more {
                    color: white;
                }
                .post-card-wrapper:hover .read-more svg {
                    transform: translateX(4px);
                }
                .post-card-wrapper:hover .post-card::before {
                    left: 200%;
                }
            `}} />
            
            <div 
                className="absolute top-0 -translate-y-1/2 left-6 z-[20] post-card-label auto-shine glass-shine transition-all"
                style={{
                    background: `linear-gradient(135deg, ${typeColor}70 0%, rgba(0,0,0,0.8) 100%)`,
                    borderColor: `${typeColor}80`,
                    transitionDuration: '0.6s',
                    transitionTimingFunction: 'var(--spring-snappy, cubic-bezier(0.175, 0.885, 0.32, 1.275))'
                }}
            >
                <span className="align-middle inline-block mt-[1px] tracking-[0.1em] drop-shadow-md relative z-10">
                    {isNews ? t('filter.news') : t('filter.blog')}
                </span>
            </div>

            <div className="post-card" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                <div className="post-card-media relative">
                    <Image
                        src={displayImg}
                        alt={post.title}
                        fill
                        className="post-image"
                        onError={() => setImgError(true)}
                        unoptimized
                    />
                </div>
                <div className="post-card-body">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-footer">
                    <span className="post-date">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString(dateLocale, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : t('post.syncing')}
                    </span>
                    <span className="read-more">
                        {t('btn.accessSource')}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </div>
            </div>
        </a>
    );
}
