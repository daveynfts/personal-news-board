'use client';

import Link from 'next/link';
import { CalendarEvent } from '@/lib/db';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface EventCalendarProps {
    events: CalendarEvent[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

    // Filter events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const featuredEventsList = upcomingEvents.length > 0 ? upcomingEvents : pastEvents;
    
    // Ensure index is within bounds in case data changes
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
                    <h1>Your Curated Universe.</h1>
                    <p>A personal collection of top news, insightful blogs, and interesting X threads. No upcoming events scheduled.</p>
                </div>
            </div>
        );
    }

    const handleNextFeatured = () => setCurrentFeaturedIndex(prev => (prev + 1) % featuredEventsList.length);
    const handlePrevFeatured = () => setCurrentFeaturedIndex(prev => (prev - 1 + featuredEventsList.length) % featuredEventsList.length);
    
    // Group events for timeline
    const groupedEvents = displayEvents.reduce((acc, event) => {
        const d = new Date(event.date);
        const dateKey = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`;
        const dayKey = d.toLocaleString('en-US', { weekday: 'long' });
        if (!acc[dateKey]) {
            acc[dateKey] = { dayKey, events: [] };
        }
        acc[dateKey].events.push(event);
        return acc;
    }, {} as Record<string, { dayKey: string, events: CalendarEvent[] }>);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            day: d.getDate(),
            weekday: d.toLocaleString('en-US', { weekday: 'short' }),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <section className="event-calendar-section">
            <div className="section-header-premium trans-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                <div>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Events &amp; Timeline</h2>
                    <div className="section-divider" style={{ marginTop: '12px' }}></div>
                </div>
                <Link
                    href="/events"
                    className="archive-view-all-btn"
                >
                    View All Events →
                </Link>
            </div>

            <div className="event-calendar-grid">
                {/* Left: Featured - No more internal title, it's now in the header or shared area if needed */}
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
                                    <span>⭐</span> FEATURED EVENT
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
                                    {featuredEvent.description || 'No description provided.'}
                                </ReactMarkdown>
                            </div>
                            <div className="event-meta-premium">
                                <div className="meta-item-badge">
                                    📍 <span>{featuredEvent.location || 'Online'}</span>
                                </div>
                                <div className="meta-item-badge">
                                    ⏰ <span>{formatDate(featuredEvent.date).time}</span>
                                </div>
                            </div>
                            {featuredEvent.link && (
                                <a href={featuredEvent.link} target="_blank" rel="noopener noreferrer" className="event-main-btn">
                                    Register Now
                                </a>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Right: Timeline Side */}
                <div className="upcoming-events-list trans-up">
                    <div className="manage-header">
                        <h2 className="timeline-section-title">Timeline</h2>
                        <div className="timeline-tabs">
                            <button type="button" className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
                            <button type="button" className={activeTab === 'past' ? 'active' : ''} onClick={() => setActiveTab('past')}>Past</button>
                        </div>
                    </div>



                    <div className="timeline-wrapper">
                        {displayEvents.length === 0 ? (
                            <div className="empty-state" style={{ padding: '60px 40px', textAlign: 'center', opacity: 0.5 }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📅</div>
                                <p style={{ color: 'var(--text-secondary)' }}>No {activeTab} events found.</p>
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
                                                        🤝 <span>By DaveyNFTs</span>
                                                    </div>
                                                    <div className="timeline-event-location">
                                                        📍 {event.location || 'Online / Link provided'}
                                                    </div>
                                                    <div className="timeline-event-actions">
                                                        <div className={`status-badge ${activeTab === 'upcoming' ? 'going' : 'past'}`}>
                                                            {activeTab === 'upcoming' ? 'Going' : 'Ended'}
                                                        </div>
                                                        {event.link && (
                                                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="rsvp-btn">
                                                                RSVP ↗
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
