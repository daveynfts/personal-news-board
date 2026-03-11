'use client';

import { useState, useEffect, useCallback } from 'react';
import { convertToWebP } from '@/lib/convertToWebP';
import { CalendarEvent } from '@/lib/db';

interface AdminEventsProps {
    addToast: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminEvents({ addToast }: AdminEventsProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [link, setLink] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ id: number; title: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const webpFile = await convertToWebP(file);
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(webpFile.name)}`, {
                method: 'POST',
                body: webpFile,
            });

            if (response.ok) {
                const blob = await response.json();
                setImageUrl(blob.url);
                addToast('Image uploaded successfully.');
            } else {
                const errData = await response.json().catch(() => ({}));
                addToast(`Upload failed: ${errData.error || response.statusText}`, 'error');
            }
        } catch (err: unknown) {
            addToast(`Error uploading: ${err instanceof Error ? err.message : 'Unknown'}`, 'error');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input to allow re-uploading the same file
        }
    };

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch('/api/events');
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch {
            addToast('Failed to sync events.', 'error');
        }
    }, [addToast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
        setLink('');
        setImageUrl('');
    };

    const startEditing = (event: CalendarEvent) => {
        setEditingId(event.id || null);
        setTitle(event.title);
        setDescription(event.description || '');
        // Format date for datetime-local input
        if (event.date) {
            const d = new Date(event.date);
            const offset = d.getTimezoneOffset() * 60000;
            const localISODate = new Date(d.getTime() - offset).toISOString().slice(0, 16);
            setDate(localISODate);
        } else {
            setDate('');
        }
        setLocation(event.location || '');
        setLink(event.link || '');
        setImageUrl(event.imageUrl || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) {
            addToast('Title and Date are required.', 'error');
            return;
        }
        setLoading(true);

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = {
                id: editingId,
                title,
                description,
                date: new Date(date).toISOString(),
                location,
                link,
                imageUrl
            };

            const res = await fetch('/api/events', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                addToast(editingId ? 'Event updated successfully.' : 'Event added to the calendar.');
                resetForm();
                fetchEvents();
            } else {
                const data = await res.json();
                addToast(data.error || 'Conservation failed.', 'error');
            }
        } catch (err: unknown) {
            addToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showConfirm) return;
        const id = showConfirm.id;
        setLoading(true);

        try {
            const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Event removed from calendar.');
                fetchEvents();
            } else {
                addToast('Failed to remove event.', 'error');
            }
        } catch (err: unknown) {
            addToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
        } finally {
            setLoading(false);
            setShowConfirm(null);
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

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

    return (
        <div className="admin-page-layout trans-enter">

            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🗑️</div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: 900 }}>Remove Event?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.95rem' }}>
                            You are about to remove:
                        </p>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
                            &quot;{showConfirm.title}&quot;
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>This action is irreversible.</p>
                        <div className="btn-group">
                            <button className="btn-secondary" onClick={() => setShowConfirm(null)}>Cancel</button>
                            <button className="btn-danger" onClick={handleDelete} disabled={loading}>
                                {loading ? 'Removing...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT: FORM */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <div className="admin-card-icon">📅</div>
                    <div>
                        <h2>{editingId ? 'Edit Event' : 'Add New Event'}</h2>
                        {editingId && <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Editing Mode</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">

                    <div className="form-section">
                        <div className="form-section-title">Event Details</div>

                        <div className="form-group">
                            <label>Event Title</label>
                            <input
                                className="form-input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g. Web3 Founders Meetup"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Date & Time</label>
                            <input
                                className="form-input"
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Location (Optional)</label>
                            <input
                                className="form-input"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="E.g. Dubai, UAE or Zoom"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea
                                className="form-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief summary of the event..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Registration Link (Optional)</label>
                            <input
                                className="form-input"
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://lu.ma/event-id"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-title">Cover Image</div>

                        <div className="form-group">
                            <label>Image URL</label>
                            <input
                                className="form-input"
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="event-file-upload"
                            disabled={uploading}
                        />
                        <label htmlFor="event-file-upload" className="upload-btn">
                            {uploading ? (
                                <><span>⏳</span> Uploading...</>
                            ) : (
                                <><span>↑</span> Upload Banner</>
                            )}
                        </label>

                        {imageUrl && (
                            <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px', fontSize: '0.7rem', color: '#fff' }}>
                                    16:9 Preview
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 2 }}>
                            {loading ? '⏳ Saving...' : editingId ? '✓ Update Event' : '🚀 Add Event'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="btn-outline" style={{ marginTop: 0 }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* RIGHT: LIST */}
            <div className="manage-container">
                <div className="manage-header" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Events Timeline</h2>
                        <div className="timeline-tabs">
                            <button type="button" className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>Upcoming ({upcomingEvents.length})</button>
                            <button type="button" className={activeTab === 'past' ? 'active' : ''} onClick={() => setActiveTab('past')}>Past ({pastEvents.length})</button>
                        </div>
                    </div>
                    <button onClick={fetchEvents} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem', height: 'fit-content' }}>↻ Sync</button>
                </div>

                <div className="timeline-wrapper">
                    {displayEvents.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px 40px', textAlign: 'center', opacity: 0.5 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📅</div>
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
                                                    🤝 <span>By Platform Admin</span>
                                                </div>
                                                <div className="timeline-event-location">
                                                    📍 {event.location || 'Online / Link provided'}
                                                </div>
                                                <div className="timeline-event-actions">
                                                    <div className={`status-badge ${activeTab === 'upcoming' ? 'going' : 'past'}`}>
                                                        {activeTab === 'upcoming' ? 'Going' : 'Ended'}
                                                    </div>
                                                    <button onClick={() => startEditing(event)} className="edit-btn">Edit</button>
                                                    <button onClick={() => setShowConfirm({ id: event.id!, title: event.title })} className="delete-btn">Remove</button>
                                                </div>
                                            </div>
                                            {event.imageUrl && (
                                                <div className="timeline-event-thumb">
                                                    <img src={event.imageUrl} alt={event.title} />
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
    );
}
