'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/db';

interface EditorialCarouselProps {
    articles: Article[];
}

export default function EditorialCarousel({ articles }: EditorialCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide every 5 seconds
    useEffect(() => {
        if (articles.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % articles.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [articles.length]);

    if (!articles || articles.length === 0) return null;

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
    };

    return (
        <div className="editorial-carousel-container trans-enter">
            <h2 className="section-title" style={{ marginBottom: '24px' }}>Editorial Picks</h2>

            <div className="carousel-wrapper" style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                maxHeight: 'calc(100vh - 200px)',
                minHeight: '300px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,215,0,0.15)'
            }}>
                <div className="carousel-slides" style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                    transform: `translateX(-${currentIndex * 100}%)`
                }}>
                    {articles.map((article) => (
                        <div key={article.id} className="carousel-slide" style={{ minWidth: '100%', height: '100%', position: 'relative' }}>
                            {/* Background Image with Overlay */}
                            <div className="carousel-bg" style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: `url(${article.coverImage ? `${article.coverImage}?t=${new Date(article.createdAt || Date.now()).getTime()}` : '/placeholder.jpg'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                zIndex: 1
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'linear-gradient(to top, rgba(10,10,12,1) 0%, rgba(10,10,12,0.6) 40%, rgba(10,10,12,0.1) 100%)'
                                }} />
                            </div>

                            {/* Content */}
                            <div className="carousel-content" style={{
                                position: 'absolute',
                                bottom: 0, left: 0, right: 0,
                                padding: '40px',
                                zIndex: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    backgroundColor: 'var(--accent-color)',
                                    color: '#000',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    borderRadius: '4px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    width: 'fit-content'
                                }}>
                                    Featured Article
                                </span>

                                <Link href={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
                                    <h3 style={{
                                        fontSize: '2.5rem',
                                        color: '#fff',
                                        margin: 0,
                                        lineHeight: 1.2,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                        cursor: 'pointer'
                                    }}>
                                        {article.title}
                                    </h3>
                                </Link>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <span>{new Date(article.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    {article.xSourceUrl && (
                                        <a href={article.xSourceUrl} target="_blank" rel="noopener noreferrer" style={{
                                            color: 'var(--accent-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            textDecoration: 'none'
                                        }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.15H5.059z" />
                                            </svg>
                                            View Source X
                                        </a>
                                    )}
                                    <Link href={`/article/${article.id}`} style={{
                                        marginLeft: 'auto',
                                        color: '#fff',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        textDecoration: 'none'
                                    }}>
                                        Read Full Article <span style={{ fontSize: '1.2rem' }}>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                {articles.length > 1 && (
                    <>
                        <button onClick={handlePrevious} className="carousel-control prev" style={{
                            position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)', transition: 'all 0.2s'
                        }} aria-label="Previous Article">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button onClick={handleNext} className="carousel-control next" style={{
                            position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)', transition: 'all 0.2s'
                        }} aria-label="Next Article">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </>
                )}

                {/* Indicators */}
                {articles.length > 1 && (
                    <div style={{
                        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '8px', zIndex: 10
                    }}>
                        {articles.map((_, idx) => (
                            <button key={idx} onClick={() => setCurrentIndex(idx)} style={{
                                width: idx === currentIndex ? '24px' : '8px', height: '8px', borderRadius: '4px',
                                background: idx === currentIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.3)',
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0
                            }} aria-label={`Go to slide ${idx + 1}`} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
