'use client';

import { CalendarEvent } from '@/lib/db';
import { useState } from 'react';

interface EventCalendarProps {
    events: CalendarEvent[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // Filter events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

    const featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : pastEvents[0];
    const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
    
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
            <div className="event-calendar-grid">
                {/* Featured Event Card */}
                {featuredEvent && (
                    <div className="featured-event-card trans-up" style={{ alignSelf: 'start', position: 'sticky', top: '120px' }}>
                        <div className="event-image">
                            {featuredEvent.imageUrl ? (
                                <img src={`${featuredEvent.imageUrl}?t=${new Date(featuredEvent.createdAt || Date.now()).getTime()}`} alt={featuredEvent.title} />
                            ) : (
                                <div className="event-image-placeholder">
                                    <span>📅</span>
                                </div>
                            )}
                            <div className="event-date-badge">
                                <span className="month">{formatDate(featuredEvent.date).month}</span>
                                <span className="day">{formatDate(featuredEvent.date).day}</span>
                            </div>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to top, var(--surface-secondary), transparent)', pointerEvents: 'none' }} />
                        </div>
                        <div className="event-info" style={{ display: 'flex', flexDirection: 'column', padding: '36px', background: 'var(--surface-secondary)' }}>
                            <div className="event-type" style={{ color: 'var(--accent-color)', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '16px' }}>
                                ⭐ FEATURED EVENT
                            </div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 950, marginBottom: '16px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                                {featuredEvent.title}
                            </h3>
                            <p className="event-desc" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px', flex: 1, lineHeight: 1.6 }}>
                                {featuredEvent.description || 'No description provided.'}
                            </p>
                            <div className="event-meta" style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📍 <span style={{ color: '#fff' }}>{featuredEvent.location || 'Online'}</span></span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>⏰ <span style={{ color: '#fff' }}>{formatDate(featuredEvent.date).time}</span></span>
                            </div>
                            {featuredEvent.link && (
                                <a href={featuredEvent.link} target="_blank" rel="noopener noreferrer" className="submit-btn" style={{ textDecoration: 'none', width: '100%', padding: '12px 24px', borderRadius: '12px', fontSize: '0.9rem' }}>
                                    Register Now
                                </a>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Timeline List */}
                <div className="upcoming-events-list">
                    <div className="manage-header" style={{ marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.8px', color: '#fff', margin: 0 }}>Events Timeline</h2>
                        </div>
                        <div className="timeline-tabs" style={{ margin: 0 }}>
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
                                                    <div className="timeline-event-thumb">
                                                        <img src={`${event.timelineImageUrl || event.imageUrl}?t=${new Date(event.createdAt || Date.now()).getTime()}`} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
