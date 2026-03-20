'use client';

import Link from 'next/link';
import { CalendarEvent } from '@/lib/db';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useTranslation } from '@/lib/LanguageContext';
import { Star, MapPin, Clock, CalendarIcon as Calendar, Users } from 'lucide-react';

interface EventCalendarProps {
    events: CalendarEvent[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    const { t, locale } = useTranslation();

    // Filter events
    const now = new Date();

    const allUpcoming = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const allPast = events.filter(e => new Date(e.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const MAX_EVENTS = 4;
    const upcomingEvents = allUpcoming.slice(0, MAX_EVENTS);
    const pastEvents = allPast.slice(0, MAX_EVENTS);

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
        >

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
                                <Image src={featuredEvent.imageUrl} alt={featuredEvent.title} fill style={{ objectFit: 'cover' }} unoptimized />
                            ) : (
                                <div className="event-image-placeholder">
                                    <Calendar size={32} className="opacity-50" />
                                </div>
                            )}
                            <div className="event-date-badge">
                                <span className="month">{formatDate(featuredEvent.date).month}</span>
                                <span className="day">{formatDate(featuredEvent.date).day}</span>
                            </div>
                        </div>
                        <div className="event-info">
                            <div className="event-info-header">
                                <div className="event-type-badge flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> {t('events.featuredEvent')}
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
                            <div className="inline-flex items-center px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg auto-shine glass-shine mb-6">
                                <h3 className="event-title relative z-10 text-white" style={{ marginBottom: 0, marginTop: 0 }}>
                                    {featuredEvent.title}
                                </h3>
                            </div>
                            <div className="event-desc-markdown">
                                <ReactMarkdown>
                                    {featuredEvent.description || t('events.noDescription')}
                                </ReactMarkdown>
                            </div>
                            <div className="event-meta-premium">
                                <div className="meta-item-badge flex items-center gap-1.5">
                                    <MapPin size={14} className="text-red-400" /> <span>{featuredEvent.location || t('events.online')}</span>
                                </div>
                                <div className="meta-item-badge flex items-center gap-1.5">
                                    <Clock size={14} className="text-blue-400" /> <span>{formatDate(featuredEvent.date).time}</span>
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
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Calendar size={48} className="opacity-50" /></div>
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
                                                    <div className="timeline-event-host flex items-center gap-1.5">
                                                        <Users size={12} className="text-gray-400" /> <span>{t('events.byDavey')}</span>
                                                    </div>
                                                    <div className="timeline-event-location flex items-center gap-1.5 mt-1">
                                                        <MapPin size={12} className="text-red-400" /> {event.location || t('events.onlineLink')}
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
                                                        <Image src={event.timelineImageUrl || event.imageUrl!} alt={event.title} fill style={{ objectFit: 'cover' }} unoptimized />
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
