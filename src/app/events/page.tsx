import { getAllEvents } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import SearchBar from '@/components/SearchBar';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return buildMetadata({
        title: 'Events & Timeline',
        description: 'All upcoming and past events curated by DaveyNFTs — conferences, meetups, and more.',
        canonicalPath: '/events',
        type: 'website',
        keywords: ['web3 events', 'crypto conference', 'NFT meetup', 'DaveyNFTs', 'blockchain events'],
        allowIndexing: true,
    });
}

export default async function EventsPage() {
    noStore();
    const allEvents = await getAllEvents();

    const now = new Date();

    const upcomingEvents = allEvents
        .filter(e => !e.isMore && new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pastEvents = allEvents
        .filter(e => !e.isMore && new Date(e.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const moreEvents = allEvents.filter(e => e.isMore)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            day: d.getDate(),
            weekday: d.toLocaleString('en-US', { weekday: 'long' }),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            full: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        };
    };

    const EventCard = ({ event, isPast = false }: { event: typeof allEvents[0]; isPast?: boolean }) => {
        const fd = formatDate(event.date);
        return (
            <div className={`archive-event-card ${isPast ? 'past' : ''}`}>
                {event.imageUrl && (
                    <div className="archive-event-image">
                        <Image src={event.imageUrl} alt={event.title} fill style={{ objectFit: 'cover' }} unoptimized />
                        {isPast && <div className="archive-event-past-overlay"><span>Ended</span></div>}
                    </div>
                )}
                <div className="archive-event-body">
                    <div className="archive-event-date-badge">
                        <span className="archive-date-month">{fd.month}</span>
                        <span className="archive-date-day">{fd.day}</span>
                    </div>
                    <div className="archive-event-info">
                        <span className={`status-badge ${isPast ? 'past' : 'going'}`} style={{ fontSize: '0.6rem', padding: '2px 8px', marginBottom: '8px', display: 'inline-block' }}>
                            {isPast ? 'Ended' : 'Upcoming'}
                        </span>
                        <h3 className="archive-event-title">{event.title}</h3>
                        {event.description && (
                            <p className="archive-event-desc">{event.description.slice(0, 120)}{event.description.length > 120 ? '...' : ''}</p>
                        )}
                        <div className="archive-event-meta">
                            <span>📍 {event.location || 'Online'}</span>
                            <span>⏰ {fd.time}</span>
                            <span>📅 {fd.weekday}, {fd.full}</span>
                        </div>
                        {event.link && (
                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="archive-event-btn">
                                {isPast ? 'View Recap ↗' : 'Register Now ↗'}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="archive-page-container">
            {/* Hero */}
            <div className="archive-hero">
                <div className="liquid-blob blob-1" style={{ opacity: 0.25, top: '-10%', left: '-5%' }} />
                <div className="liquid-blob blob-2" style={{ opacity: 0.2, bottom: '-20%', right: '0%' }} />
                <Container>
                    <div className="archive-hero-content">
                        <Link href="/" className="more-back-btn">← Back to Home</Link>
                        <div style={{ marginTop: '24px' }}>
                            <span className="more-label">📅 Full Archive</span>
                            <h1 className="archive-hero-title">Events & Timeline</h1>
                            <p className="archive-hero-subtitle">
                                All conferences, meetups, and web3 events — upcoming and past.
                            </p>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <SearchBar scope="events" placeholder="Search events..." compact />
                        </div>
                        <div className="archive-hero-stats">
                            <div className="archive-stat">
                                <span className="archive-stat-num">{upcomingEvents.length}</span>
                                <span className="archive-stat-label">Upcoming</span>
                            </div>
                            <div className="archive-stat-sep" />
                            <div className="archive-stat">
                                <span className="archive-stat-num">{pastEvents.length}</span>
                                <span className="archive-stat-label">Past</span>
                            </div>
                            {moreEvents.length > 0 && (
                                <>
                                    <div className="archive-stat-sep" />
                                    <div className="archive-stat">
                                        <span className="archive-stat-num">{moreEvents.length}</span>
                                        <span className="archive-stat-label">Archived</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Container>
            </div>

            <Container style={{ paddingTop: '60px', paddingBottom: '120px' }}>
                {allEvents.length === 0 ? (
                    <div className="more-empty-state">
                        <div className="more-empty-icon">📅</div>
                        <h2>No events yet</h2>
                        <p>Events added through the admin panel will appear here.</p>
                        <Link href="/admin" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '24px' }}>Go to Admin</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
                        {/* Upcoming */}
                        {upcomingEvents.length > 0 && (
                            <section>
                                <div className="archive-section-header">
                                    <h2 className="archive-section-title">
                                        <span className="archive-section-dot going" />
                                        Upcoming Events
                                    </h2>
                                    <span className="more-month-count">{upcomingEvents.length}</span>
                                </div>
                                <div className="archive-events-list">
                                    {upcomingEvents.map(event => (
                                        <EventCard key={event.id} event={event} isPast={false} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Past */}
                        {pastEvents.length > 0 && (
                            <section>
                                <div className="archive-section-header">
                                    <h2 className="archive-section-title">
                                        <span className="archive-section-dot past" />
                                        Past Events
                                    </h2>
                                    <span className="more-month-count">{pastEvents.length}</span>
                                </div>
                                <div className="archive-events-list">
                                    {pastEvents.map(event => (
                                        <EventCard key={event.id} event={event} isPast={true} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* More / Archived */}
                        {moreEvents.length > 0 && (
                            <section>
                                <div className="archive-section-header">
                                    <h2 className="archive-section-title">
                                        <span className="archive-section-dot" style={{ background: 'var(--text-muted)' }} />
                                        Extended Archive
                                    </h2>
                                    <span className="more-month-count">{moreEvents.length}</span>
                                </div>
                                <div className="archive-events-list">
                                    {moreEvents.map(event => (
                                        <EventCard key={event.id} event={event} isPast={true} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}
