'use client';

import { useState, useEffect, useCallback } from 'react';
import { convertToWebP } from '@/lib/convertToWebP';
import { CalendarEvent } from '@/lib/db';
import ImageCropperModal from './ImageCropperModal';
import Image from 'next/image';

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
    const [timelineImageUrl, setTimelineImageUrl] = useState('');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ id: number; title: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [cropFile, setCropFile] = useState<{ src: string, file: File, type: 'cover' | 'timeline' } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'timeline' = 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show cropper first
        const objUrl = URL.createObjectURL(file);
        setCropFile({ src: objUrl, file, type });
        
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const handleCropComplete = async (croppedFile: File) => {
        const cropType = cropFile?.type; // Save type BEFORE clearing state
        if (cropFile) {
            URL.revokeObjectURL(cropFile.src);
        }
        setCropFile(null);
        setUploading(true);
        try {
            const webpFile = await convertToWebP(croppedFile);
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(webpFile.name)}`, {
                method: 'POST',
                body: webpFile,
            });

            if (response.ok) {
                const blob = await response.json();
                if (cropType === 'timeline') {
                    setTimelineImageUrl(blob.url);
                } else {
                    setImageUrl(blob.url);
                }
                addToast('Image uploaded successfully.');
            } else {
                const errData = await response.json().catch(() => ({}));
                addToast(`Upload failed: ${errData.error || response.statusText}`, 'error');
            }
        } catch (err: unknown) {
            addToast(`Error uploading: ${err instanceof Error ? err.message : 'Unknown'}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleCropCancel = () => {
        if (cropFile) {
            URL.revokeObjectURL(cropFile.src);
        }
        setCropFile(null);
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
        setTimelineImageUrl('');
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
        setTimelineImageUrl(event.timelineImageUrl || '');
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
                imageUrl,
                timelineImageUrl
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
                addToast(data.error || 'Operation failed.', 'error');
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
                    <div className="apple-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '24px' }}>📅</div>
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '12px', fontWeight: 900, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Remove Event?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '1.05rem', lineHeight: 1.5 }}>
                            You are about to remove <br/>
                            <strong style={{ color: '#fff' }}>&quot;{showConfirm.title}&quot;</strong>
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>This action is irreversible.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button className="edit-btn" style={{ padding: '16px' }} onClick={() => setShowConfirm(null)}>Cancel</button>
                            <button className="submit-btn" style={{ background: '#ff453a', color: '#fff', padding: '16px', marginTop: 0 }} onClick={handleDelete} disabled={loading}>
                                {loading ? 'Removing...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {cropFile && (
                <ImageCropperModal
                    imageSrc={cropFile.src}
                    fileName={cropFile.file.name}
                    aspectRatio={cropFile.type === 'timeline' ? 1 : 16 / 9}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            {/* LEFT: FORM */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <div className="admin-card-icon">📅</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{editingId ? 'Edit Event' : 'Add New Event'}</h2>
                        {editingId && <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Session</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                                <label>Location</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Dubai, UAE or Zoom"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                className="form-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief summary of the event..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Registration Link</label>
                            <input
                                className="form-input"
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://lu.ma/event-id"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>Cover Banner (16:9)</label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        className="form-input"
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="URL..."
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileUpload(e, 'cover')}
                                        disabled={uploading}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="event-file-upload-cover"
                                    />
                                    <label htmlFor="event-file-upload-cover" className="edit-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        ↑
                                    </label>
                                </div>
                                {imageUrl && (
                                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                                        <Image src={imageUrl} alt="Banner" fill style={{ objectFit: 'cover' }} unoptimized />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Timeline Thumbnail (1:1)</label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        className="form-input"
                                        type="url"
                                        value={timelineImageUrl}
                                        onChange={(e) => setTimelineImageUrl(e.target.value)}
                                        placeholder="URL..."
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileUpload(e, 'timeline')}
                                        disabled={uploading}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="event-file-upload-timeline"
                                    />
                                    <label htmlFor="event-file-upload-timeline" className="edit-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        ↑
                                    </label>
                                </div>
                                {timelineImageUrl && (
                                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', aspectRatio: '1/1', width: '60px', background: '#000', position: 'relative' }}>
                                        <Image src={timelineImageUrl} alt="Thumb" fill style={{ objectFit: 'cover' }} unoptimized />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                            <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 1 }}>
                                {loading ? '⏳ Processing...' : editingId ? '✓ Update Event' : '🚀 Add to Calendar'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="edit-btn">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* RIGHT: LIST */}
            <div className="manage-container">
                <div className="manage-header" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Timeline</h2>
                        <div className="admin-header-tabs" style={{ marginTop: '12px' }}>
                            <button type="button" className={`admin-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming ({upcomingEvents.length})</button>
                            <button type="button" className={`admin-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Archive ({pastEvents.length})</button>
                        </div>
                    </div>
                    <button onClick={async () => { await fetchEvents(); addToast('Timeline synced.'); }} className="edit-btn" style={{ fontSize: '0.75rem' }}>↻ Sync</button>
                </div>

                <div className="timeline-wrapper">
                    {displayEvents.length === 0 ? (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
                            <p>No {activeTab} events.</p>
                        </div>
                    ) : (
                        Object.entries(groupedEvents).map(([dateKey, { dayKey, events }]) => (
                            <div key={dateKey} className="timeline-group">
                                <div className="timeline-date-col" style={{ width: '100px' }}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-date-text" style={{ fontSize: '1rem', fontWeight: 900 }}>{dateKey}</div>
                                    <div className="timeline-day-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{dayKey}</div>
                                </div>
                                <div className="timeline-events-col">
                                    {events.map((event) => (
                                        <div key={event.id} className="timeline-event-card" style={{ border: '1px solid var(--glass-border)' }}>
                                            <div className="timeline-event-content">
                                                <div className="timeline-event-time" style={{ color: 'var(--accent-color)', fontWeight: 800 }}>
                                                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="timeline-event-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>{event.title}</div>
                                                <div className="timeline-event-location" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                                    📍 {event.location || 'Location TBD'}
                                                </div>
                                                <div className="timeline-event-actions" style={{ marginTop: '16px' }}>
                                                    <span className={`status-badge ${activeTab === 'upcoming' ? 'going' : 'past'}`}>
                                                        {activeTab === 'upcoming' ? 'Active' : 'Archived'}
                                                    </span>
                                                    <button onClick={() => startEditing(event)} className="edit-btn">Edit</button>
                                                    <button onClick={() => setShowConfirm({ id: event.id!, title: event.title })} className="delete-btn">Delete</button>
                                                </div>
                                            </div>
                                            {(event.timelineImageUrl || event.imageUrl) && (
                                                <div className="timeline-event-thumb" style={{ width: '80px', height: '80px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                                                    <Image src={event.timelineImageUrl || event.imageUrl || ''} alt={event.title} fill style={{ objectFit: 'cover' }} unoptimized />
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
