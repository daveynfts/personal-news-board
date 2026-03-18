'use client';

import Link from 'next/link';
import { CalendarEvent } from '@/lib/db';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useTranslation } from '@/lib/LanguageContext';

interface EventCalendarProps {
    events: CalendarEvent[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    const orbRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const orbPos = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(null);
    const isHovering = useRef(false);
    const { t, locale } = useTranslation();

    // Filter events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const featuredEventsList = upcomingEvents.length > 0 ? upcomingEvents : pastEvents;
    
    const displayFeaturedIndex = currentFeaturedIndex >= featuredEventsList.length ? 0 : currentFeaturedIndex;
    const featuredEvent = featuredEventsList[displayFeaturedIndex] || null;
    const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
    
    // Auto-rotate featured event every 7 seconds
    useEffect(() => {
        if (featuredEventsList.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentFeaturedIndex(prev => (prev + 1) % featuredEventsList.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [featuredEventsList.length]);

    // ── Liquid Glass Orb Animation ──────────────────────────────────────────
    const animateOrb = useCallback(() => {
        const lerp = 0.12;
        orbPos.current.x += (mousePos.current.x - orbPos.current.x) * lerp;
        orbPos.current.y += (mousePos.current.y - orbPos.current.y) * lerp;

        if (orbRef.current) {
            orbRef.current.style.transform = `translate(${orbPos.current.x}px, ${orbPos.current.y}px) translate(-50%, -50%)`;
        }

        rafRef.current = requestAnimationFrame(animateOrb);
    }, []);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(animateOrb);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [animateOrb]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        mousePos.current.x = e.clientX - rect.left;
        mousePos.current.y = e.clientY - rect.top;

        // 3D tilt effect on cards
        const cards = sectionRef.current.querySelectorAll<HTMLElement>('.featured-event-card, .timeline-event-card');
        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const deltaX = (e.clientX - cardCenterX) / cardRect.width;
            const deltaY = (e.clientY - cardCenterY) / cardRect.height;
            const dist = Math.sqrt(deltaX ** 2 + deltaY ** 2);

            if (dist < 1.5) {
                const intensity = Math.max(0, 1 - dist / 1.5);
                const rotateX = deltaY * intensity * -4;
                const rotateY = deltaX * intensity * 4;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${1 + intensity * 0.015})`;
            } else {
                card.style.transform = '';
            }
        });
    }, []);

    const handleMouseEnter = () => {
        isHovering.current = true;
        if (orbRef.current) orbRef.current.style.opacity = '1';
    };

    const handleMouseLeave = () => {
        isHovering.current = false;
        if (orbRef.current) orbRef.current.style.opacity = '0';
        // Reset all card transforms
        if (sectionRef.current) {
            const cards = sectionRef.current.querySelectorAll<HTMLElement>('.featured-event-card, .timeline-event-card');
            cards.forEach(card => { card.style.transform = ''; });
        }
    };

    if (events.length === 0) {
        return (
            <div className="event-hero-empty">
                <div className="event-hero-content">
                    <h1>{t('hero.title')}</h1>
                    <p>{t('hero.noEvents')}</p>
                </div>
            </div>
        );
    }

    const handleNextFeatured = () => setCurrentFeaturedIndex(prev => (prev + 1) % featuredEventsList.length);
    const handlePrevFeatured = () => setCurrentFeaturedIndex(prev => (prev - 1 + featuredEventsList.length) % featuredEventsList.length);
    
    const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

    // Group events for timeline
    const groupedEvents = displayEvents.reduce((acc, event) => {
        const d = new Date(event.date);
        const dateKey = `${d.toLocaleString(dateLocale, { month: 'short' })} ${d.getDate()}`;
        const dayKey = d.toLocaleString(dateLocale, { weekday: 'long' });
        if (!acc[dateKey]) {
            acc[dateKey] = { dayKey, events: [] };
        }
        acc[dateKey].events.push(event);
        return acc;
    }, {} as Record<string, { dayKey: string, events: CalendarEvent[] }>);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            month: d.toLocaleString(dateLocale, { month: 'short' }).toUpperCase(),
            day: d.getDate(),
            weekday: d.toLocaleString(dateLocale, { weekday: 'short' }),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <section
            className="event-calendar-section"
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Liquid Glass Orb */}
            <div ref={orbRef} className="liquid-orb" aria-hidden="true">
                <div className="liquid-orb-inner" />
                <div className="liquid-orb-ring" />
                <div className="liquid-orb-specular" />
            </div>

            <div className="section-header-premium trans-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                <div>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>{t('section.eventsTimeline')}</h2>
                    <div className="section-divider" style={{ marginTop: '12px' }}></div>
                </div>
                <Link
                    href="/events"
                    className="archive-view-all-btn"
                >
                    {t('btn.viewAllEvents')}
                </Link>
            </div>

            <div className="event-calendar-grid">
                {/* Left: Featured */}
                {featuredEvent && (
                    <div key={featuredEvent.id} className="featured-event-card trans-up">
                        <div className="event-image">
                            {featuredEvent.imageUrl ? (
                                <Image src={`${featuredEvent.imageUrl}?t=${featuredEvent.createdAt ? new Date(featuredEvent.createdAt).getTime() : 0}`} alt={featuredEvent.title} fill style={{ objectFit: 'cover' }} unoptimized />
                            ) : (
                                <div className="event-image-placeholder">
                                    <span>📅</span>
                                </div>
                            )}
                            <div className="event-date-badge">
                                <span className="month">{formatDate(featuredEvent.date).month}</span>
                                <span className="day">{formatDate(featuredEvent.date).day}</span>
                            </div>
                        </div>
                        <div className="event-info">
                            <div className="event-info-header">
                                <div className="event-type-badge">
                                    <span>⭐</span> {t('events.featuredEvent')}
                                </div>
                                {featuredEventsList.length > 1 && (
                                    <div className="featured-controls">
                                        <button onClick={handlePrevFeatured} className="carousel-control" aria-label="Previous">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                                        </button>
                                        <button onClick={handleNextFeatured} className="carousel-control" aria-label="Next">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h3 className="event-title">
                                {featuredEvent.title}
                            </h3>
                            <div className="event-desc-markdown">
                                <ReactMarkdown>
                                    {featuredEvent.description || t('events.noDescription')}
                                </ReactMarkdown>
                            </div>
                            <div className="event-meta-premium">
                                <div className="meta-item-badge">
                                    📍 <span>{featuredEvent.location || t('events.online')}</span>
                                </div>
                                <div className="meta-item-badge">
                                    ⏰ <span>{formatDate(featuredEvent.date).time}</span>
                                </div>
                            </div>
                            {featuredEvent.link && (
                                <a href={featuredEvent.link} target="_blank" rel="noopener noreferrer" className="event-main-btn">
                                    {t('btn.registerNow')}
                                </a>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Right: Timeline Side */}
                <div className="upcoming-events-list trans-up">
                    <div className="manage-header">
                        <h2 className="timeline-section-title">{t('section.timeline')}</h2>
                        <div className="timeline-tabs">
                            <button type="button" className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>{t('events.upcoming')}</button>
                            <button type="button" className={activeTab === 'past' ? 'active' : ''} onClick={() => setActiveTab('past')}>{t('events.past')}</button>
                        </div>
                    </div>

                    <div className="timeline-wrapper">
                        {displayEvents.length === 0 ? (
                            <div className="empty-state" style={{ padding: '60px 40px', textAlign: 'center', opacity: 0.5 }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📅</div>
                                <p style={{ color: 'var(--text-secondary)' }}>{activeTab === 'upcoming' ? t('events.noUpcoming') : t('events.noPast')}</p>
                            </div>
                        ) : (
                            Object.entries(groupedEvents).map(([dateKey, { dayKey, events }]) => (
                                <div key={dateKey} className="timeline-group">
                                    <div className="timeline-date-col">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-date-text">{dateKey}</div>
                                        <div className="timeline-day-text">{dayKey}</div>
                                    </div>
                                    <div className="timeline-events-col">
                                        {events.map((event) => (
                                            <div key={event.id} className="timeline-event-card">
                                                <div className="timeline-event-content">
                                                    <div className="timeline-event-time">
                                                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="timeline-event-title">{event.title}</div>
                                                    <div className="timeline-event-host">
                                                        🤝 <span>{t('events.byDavey')}</span>
                                                    </div>
                                                    <div className="timeline-event-location">
                                                        📍 {event.location || t('events.onlineLink')}
                                                    </div>
                                                    <div className="timeline-event-actions">
                                                        <div className={`status-badge ${activeTab === 'upcoming' ? 'going' : 'past'}`}>
                                                            {activeTab === 'upcoming' ? t('events.going') : t('events.ended')}
                                                        </div>
                                                        {event.link && (
                                                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="rsvp-btn">
                                                                {t('btn.rsvp')}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                {(event.timelineImageUrl || event.imageUrl) && (
                                                    <div className="timeline-event-thumb" style={{ position: 'relative', overflow: 'hidden' }}>
                                                        <Image src={`${event.timelineImageUrl || event.imageUrl}?t=${event.createdAt ? new Date(event.createdAt).getTime() : 0}`} alt={event.title} fill style={{ objectFit: 'cover' }} unoptimized />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
