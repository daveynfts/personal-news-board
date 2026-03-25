'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/db';
import styles from './EditorialCarousel.module.css';
import Container from './Container';
import { useTranslation } from '@/lib/LanguageContext';
import { useSwipe } from '@/hooks/useSwipe';

interface EditorialCarouselProps {
    articles: Article[];
}

export default function EditorialCarousel({ articles }: EditorialCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { t, locale } = useTranslation();

    // Auto-slide every 6 seconds
    useEffect(() => {
        if (articles.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % articles.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [articles.length]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
    };

    // Swipe left/right to navigate carousel
    const swipeRef = useSwipe<HTMLDivElement>({
        onSwipeLeft: handleNext,
        onSwipeRight: handlePrevious,
        threshold: 40,
    });

    if (!articles || articles.length === 0) return null;

    const currentArticle = articles[currentIndex];
    const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

    return (
        <div className={`${styles['editorial-carousel-container']}`}>
            <Container>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>{t('section.editorialPicks')}</h2>
                    <Link href="/articles" className="archive-view-all-btn">{t('btn.viewAllArticles')}</Link>
                </div>

                <div className={`${styles['editorial-carousel-premium']}`} ref={swipeRef}>
                    {/* Background Image - crossfade style */}
                    {articles.map((article, idx) => (
                        <div
                            key={article.id}
                            className={`${styles['carousel-bg-layer']}`}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${article.coverImage ? `${article.coverImage}?t=${article.createdAt ? new Date(article.createdAt).getTime() : 0}` : '/placeholder.jpg'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                opacity: idx === currentIndex ? 1 : 0,
                                transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 1
                            }}
                        />
                    ))}

                    {/* Dark overlay for text readability */}
                    <div className={`${styles['carousel-overlay']}`} />

                    {/* Content overlay */}
                    <div className={`${styles['carousel-slide-content']}`}>
                        <div className={`${styles['carousel-content-inner']}`}>
                            <span className={`${styles['carousel-tag']}`}>
                                {t('carousel.featuredArticle')}
                            </span>

                            <Link href={`/article/${currentArticle.id}`} style={{ textDecoration: 'none' }}>
                                <h3 className={`${styles['carousel-title']}`}>
                                    {currentArticle.title}
                                </h3>
                            </Link>

                            <div className={`${styles['carousel-footer']}`}>
                                <div className={`${styles['carousel-meta']}`}>
                                    <span className={`${styles['carousel-date']}`}>
                                        {new Date(currentArticle.createdAt || '').toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                    {currentArticle.xSourceUrl && (
                                        <a href={currentArticle.xSourceUrl} target="_blank" rel="noopener noreferrer" className={`${styles['carousel-x-link']}`}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.15H5.059z" />
                                            </svg>
                                            {t('carousel.source')}
                                        </a>
                                    )}
                                </div>
                                <Link href={`/article/${currentArticle.id}`} className={`${styles['carousel-read-btn']}`}>
                                    {t('btn.readArticle')} <span style={{ fontSize: '1.1rem' }}>→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Indicators inline with content */}
                        {articles.length > 1 && (
                            <div className={`${styles['carousel-indicators']}`}>
                                {articles.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`${styles['carousel-dot']} ${idx === currentIndex ? styles.active : ''}`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                                <span className={`${styles['carousel-counter']}`}>
                                    {currentIndex + 1} / {articles.length}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Nav arrows */}
                    {articles.length > 1 && (
                        <>
                            <button onClick={handlePrevious} className={`${styles['carousel-nav-btn']} prev`} aria-label="Previous Article">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <button onClick={handleNext} className={`${styles['carousel-nav-btn']} next`} aria-label="Next Article">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </>
                    )}
                </div>
            </Container>
        </div>
    );
}
