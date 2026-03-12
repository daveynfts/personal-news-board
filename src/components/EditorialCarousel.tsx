'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/db';
import Container from './Container';

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
            <Container>
                <h2 className="section-title">Editorial Picks</h2>

                <div className="editorial-carousel-premium">
                    <div className="carousel-slides" style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
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
                                }} />

                                {/* Content */}
                                <div className="carousel-slide-content">
                                    <span className="carousel-tag">
                                        Featured Article
                                    </span>

                                    <Link href={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
                                        <h3 className="carousel-title">
                                            {article.title}
                                        </h3>
                                    </Link>

                                    <div className="carousel-footer">
                                        <span>{new Date(article.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        {article.xSourceUrl && (
                                            <a href={article.xSourceUrl} target="_blank" rel="noopener noreferrer" style={{
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                textDecoration: 'none',
                                                fontWeight: 600
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.15H5.059z" />
                                                </svg>
                                                Source X
                                            </a>
                                        )}
                                        <Link href={`/article/${article.id}`} className="carousel-read-btn">
                                            Read Article <span style={{ fontSize: '1.2rem' }}>→</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    {articles.length > 1 && (
                        <>
                            <button onClick={handlePrevious} className="carousel-nav-btn prev" style={{
                                position: 'absolute', top: '50%', left: '32px', transform: 'translateY(-50%)',
                                zIndex: 20
                            }} aria-label="Previous Article">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <button onClick={handleNext} className="carousel-nav-btn next" style={{
                                position: 'absolute', top: '50%', right: '32px', transform: 'translateY(-50%)',
                                zIndex: 20
                            }} aria-label="Next Article">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </>
                    )}

                    {/* Indicators */}
                    {articles.length > 1 && (
                        <div style={{
                            position: 'absolute', bottom: '32px', left: '60px',
                            display: 'flex', gap: '8px', zIndex: 20
                        }}>
                            {articles.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentIndex(idx)} style={{
                                    width: idx === currentIndex ? '32px' : '8px', height: '4px', borderRadius: '2px',
                                    background: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.4s'
                                }} aria-label={`Go to slide ${idx + 1}`} />
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );

}
