'use client';

import Link from 'next/link';
import styles from './EventCalendar.module.css';
import { CalendarEvent } from '@/lib/db';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useTranslation } from '@/lib/LanguageContext';
import { Star, MapPin, Clock, CalendarIcon as Calendar, Users } from 'lucide-react';
import { useSwipe } from '@/hooks/useSwipe';

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

    const handleNextFeatured = () => setCurrentFeaturedIndex(prev => (prev + 1) % featuredEventsList.length);
    const handlePrevFeatured = () => setCurrentFeaturedIndex(prev => (prev - 1 + featuredEventsList.length) % featuredEventsList.length);
    
    // Swipe left/right on featured event card
    const eventSwipeRef = useSwipe<HTMLDivElement>({
        onSwipeLeft: handleNextFeatured,
        onSwipeRight: handlePrevFeatured,
        threshold: 40,
    });

    if (events.length === 0) {
        return (
            <div className={`${styles['event-hero-empty']}`}>
                <div className={`${styles['event-hero-content']}`}>
                    <h1>{t('hero.title')}</h1>
                    <p>{t('hero.noEvents')}</p>
                </div>
            </div>
        );
    }

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
            className={`${styles['event-calendar-section']}`}
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
                    {t('btn.viewAllEvents')} &rarr;
                </Link>
            </div>

            <div className={`${styles['event-calendar-grid']}`}>
                {/* Left: Featured */}
                {featuredEvent && (
                    <div key={featuredEvent.id} className={`${styles['featured-event-card']} trans-up`} ref={eventSwipeRef}>
                        <div className={`${styles['event-image']}`}>
                            {featuredEvent.imageUrl ? (
                                <Image src={featuredEvent.imageUrl} alt={featuredEvent.title} fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className={`${styles['event-image-placeholder']}`}>
                                    <Calendar size={32} className="opacity-50" />
                                </div>
                            )}
                            <div className={`${styles['event-date-badge']}`}>
                                <span className={`${styles['month']}`}>{formatDate(featuredEvent.date).month}</span>
                                <span className={`${styles['day']}`}>{formatDate(featuredEvent.date).day}</span>
                            </div>
                        </div>
                        <div className={`${styles['event-info']}`}>
                            <div className={`${styles['event-info-header']}`}>
                                <div className={`${styles['event-type-badge']} flex items-center gap-1`}>
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> {t('events.featuredEvent')}
                                </div>
                                {featuredEventsList.length > 1 && (
                                    <div className={`${styles['featured-controls']}`}>
                                        <button onClick={handlePrevFeatured} className={`${styles['carousel-control']}`} aria-label="Previous">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                                        </button>
                                        <button onClick={handleNextFeatured} className={`${styles['carousel-control']}`} aria-label="Next">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="inline-flex items-center px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg auto-shine glass-shine mb-6">
                                <h3 className={`${styles['event-title']} relative z-10 text-white`} style={{ marginBottom: 0, marginTop: 0 }}>
                                    {featuredEvent.title}
                                </h3>
                            </div>
                            <div className={`${styles['event-desc-markdown']}`}>
                                <ReactMarkdown>
                                    {featuredEvent.description || t('events.noDescription')}
                                </ReactMarkdown>
                            </div>
                            <div className={`${styles['event-meta-premium']}`}>
                                <div className={`${styles['meta-item-badge']} flex items-center gap-1.5`}>
                                    <MapPin size={14} className="text-red-400" /> <span>{featuredEvent.location || t('events.online')}</span>
                                </div>
                                <div className={`${styles['meta-item-badge']} flex items-center gap-1.5`}>
                                    <Clock size={14} className="text-blue-400" /> <span>{formatDate(featuredEvent.date).time}</span>
                                </div>
                            </div>
                            {featuredEvent.link && (
                                <a href={featuredEvent.link} target="_blank" rel="noopener noreferrer" className={`${styles['event-main-btn']}`}>
                                    {t('btn.registerNow')}
                                </a>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Right: Timeline Side */}
                <div className={`${styles['upcoming-events-list']} trans-up`}>
                    <div className={`${styles['manage-header']}`}>
                        <h2 className={`${styles['timeline-section-title']}`}>{t('section.timeline')}</h2>
                        <div className={`${styles['timeline-tabs']}`}>
                            <button type="button" className={activeTab === 'upcoming' ? styles['active'] : ''} onClick={() => setActiveTab('upcoming')}>{t('events.upcoming')}</button>
                            <button type="button" className={activeTab === 'past' ? styles['active'] : ''} onClick={() => setActiveTab('past')}>{t('events.past')}</button>
                        </div>
                    </div>

                    <div className={`${styles['timeline-wrapper']}`}>
                        {displayEvents.length === 0 ? (
                            <div className={`${styles['empty-state']}`} style={{ padding: '60px 40px', textAlign: 'center', opacity: 0.5 }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Calendar size={48} className="opacity-50" /></div>
                                <p style={{ color: 'var(--text-secondary)' }}>{activeTab === 'upcoming' ? t('events.noUpcoming') : t('events.noPast')}</p>
                            </div>
                        ) : (
                            Object.entries(groupedEvents).map(([dateKey, { dayKey, events }]) => (
                                <div key={dateKey} className={`${styles['timeline-group']}`}>
                                    <div className={`${styles['timeline-date-col']}`}>
                                        <div className={`${styles['timeline-dot']}`}></div>
                                        <div className={`${styles['timeline-date-text']}`}>{dateKey}</div>
                                        <div className={`${styles['timeline-day-text']}`}>{dayKey}</div>
                                    </div>
                                    <div className={`${styles['timeline-events-col']}`}>
                                        {events.map((event) => (
                                            <div key={event.id} className={`${styles['timeline-event-card']}`}>
                                                <div className={`${styles['timeline-event-content']}`}>
                                                    <div className={`${styles['timeline-event-time']}`}>
                                                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className={`${styles['timeline-event-title']}`}>{event.title}</div>
                                                    <div className={`${styles['timeline-event-host']} flex items-center gap-1.5`}>
                                                        <Users size={12} className="text-gray-400" /> <span>{t('events.byDavey')}</span>
                                                    </div>
                                                    <div className={`${styles['timeline-event-location']} flex items-center gap-1.5 mt-1`}>
                                                        <MapPin size={12} className="text-red-400" /> {event.location || t('events.onlineLink')}
                                                    </div>
                                                    <div className={`${styles['timeline-event-actions']}`}>
                                                        <div className={`${styles['status-badge']} ${activeTab === 'upcoming' ? styles['going'] : styles['past']}`}>
                                                            {activeTab === 'upcoming' ? t('events.going') : t('events.ended')}
                                                        </div>
                                                        {event.link && (
                                                            <a href={event.link} target="_blank" rel="noopener noreferrer" className={`${styles['rsvp-btn']}`}>
                                                                {t('btn.rsvp')}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                {(event.timelineImageUrl || event.imageUrl) && (
                                                    <div className={`${styles['timeline-event-thumb']}`} style={{ position: 'relative', overflow: 'hidden' }}>
                                                        <Image src={event.timelineImageUrl || event.imageUrl!} alt={event.title} fill style={{ objectFit: 'cover' }} />
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
