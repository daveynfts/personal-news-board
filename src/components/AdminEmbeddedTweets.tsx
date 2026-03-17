'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tweet } from 'react-tweet';

interface EmbeddedTweet {
    id?: number;
    tweetId: string;
    label: string;
    category: string;
    sortOrder: number;
    isVisible: boolean;
}

interface Props {
    addToast: (message: string, type?: 'success' | 'error') => void;
}

function extractTweetId(input: string): string {
    // Accept full URL or just ID
    const match = input.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    if (match) return match[1];
    // If it's just digits, return as-is
    if (/^\d+$/.test(input.trim())) return input.trim();
    return input.trim();
}

export default function AdminEmbeddedTweets({ addToast }: Props) {
    const [tweets, setTweets] = useState<EmbeddedTweet[]>([]);
    const [tweetInput, setTweetInput] = useState('');
    const [label, setLabel] = useState('');
    const [category, setCategory] = useState('general');
    const [sortOrder, setSortOrder] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [previewId, setPreviewId] = useState<string | null>(null);

    const fetchTweets = useCallback(async () => {
        try {
            const res = await fetch('/api/embedded-tweets?all=true');
            const data = await res.json();
            setTweets(Array.isArray(data) ? data : []);
        } catch { addToast('Failed to fetch tweets.', 'error'); }
    }, [addToast]);

    useEffect(() => { fetchTweets(); }, [fetchTweets]);

    const resetForm = () => {
        setEditId(null);
        setTweetInput('');
        setLabel('');
        setCategory('general');
        setSortOrder(0);
        setPreviewId(null);
    };

    const startEdit = (t: EmbeddedTweet) => {
        setEditId(t.id!);
        setTweetInput(t.tweetId);
        setLabel(t.label);
        setCategory(t.category);
        setSortOrder(t.sortOrder);
        setPreviewId(t.tweetId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePreview = () => {
        const id = extractTweetId(tweetInput);
        if (id) setPreviewId(id);
        else addToast('Please enter a valid tweet URL or ID.', 'error');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tweetId = extractTweetId(tweetInput);
        if (!tweetId) { addToast('Please enter a valid tweet URL or ID.', 'error'); return; }
        setLoading(true);
        const body = { tweetId, label, category, sortOrder, isVisible: true, ...(editId ? { id: editId } : {}) };
        try {
            const res = await fetch('/api/embedded-tweets', {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                addToast(editId ? 'Tweet updated.' : 'Tweet embedded!');
                resetForm();
                fetchTweets();
            } else addToast('Failed to save.', 'error');
        } catch { addToast('Network error.', 'error'); }
        finally { setLoading(false); }
    };

    const deleteTweet = async (id: number) => {
        try {
            const res = await fetch(`/api/embedded-tweets?id=${id}`, { method: 'DELETE' });
            if (res.ok) { addToast('Tweet removed.'); fetchTweets(); }
        } catch { addToast('Delete failed.', 'error'); }
    };

    const toggleVisibility = async (t: EmbeddedTweet) => {
        try {
            await fetch('/api/embedded-tweets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: t.id, isVisible: !t.isVisible }),
            });
            addToast(t.isVisible ? 'Hidden.' : 'Visible.');
            fetchTweets();
        } catch { addToast('Failed.', 'error'); }
    };

    return (
        <div className="admin-page-layout trans-enter">
            {/* Add/Edit Form */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <div className="admin-card-icon">🐦</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{editId ? 'Edit Tweet' : 'Embed Tweet'}</h2>
                        {editId && <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Editing</span>}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group">
                            <label>Tweet URL or ID *</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="form-input"
                                    value={tweetInput}
                                    onChange={e => setTweetInput(e.target.value)}
                                    placeholder="https://x.com/user/status/123456... or 123456..."
                                    style={{ flex: 1 }}
                                />
                                <button type="button" onClick={handlePreview} className="edit-btn" style={{ whiteSpace: 'nowrap', padding: '6px 16px' }}>
                                    👁 Preview
                                </button>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                Paste a full X/Twitter URL or just the numeric tweet ID
                            </span>
                        </div>

                        {/* Preview */}
                        {previewId && (
                            <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', marginBottom: '12px' }}>📱 Live Preview</div>
                                <div data-theme="dark" style={{ maxWidth: '100%' }}>
                                    <Tweet id={previewId} />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Label <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                                <input className="form-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Breaking News, Market Update..." />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="general">General</option>
                                    <option value="breaking">Breaking News</option>
                                    <option value="analysis">Analysis</option>
                                    <option value="alpha">Alpha</option>
                                    <option value="thread">Thread</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Sort Order</label>
                            <input className="form-input" type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} style={{ width: '100px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 1 }}>
                                {loading ? '⏳ Saving...' : editId ? '✓ Update Tweet' : '🚀 Embed Tweet'}
                            </button>
                            {editId && <button type="button" onClick={resetForm} className="edit-btn">Cancel</button>}
                        </div>
                    </div>
                </form>
            </div>

            {/* Tweet List */}
            <div className="manage-container">
                <div className="manage-header">
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Embedded Tweets</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>{tweets.length} configured</p>
                    </div>
                    <button onClick={() => { fetchTweets(); addToast('Synced.'); }} className="edit-btn" style={{ fontSize: '0.75rem' }}>↻ Sync</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {tweets.length === 0 ? (
                        <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐦</div>
                            <p>No tweets embedded yet.</p>
                            <p style={{ fontSize: '0.75rem', marginTop: '8px' }}>Paste a tweet URL above to get started.</p>
                        </div>
                    ) : tweets.map(t => (
                        <div key={t.id} className="post-item-admin" style={{ opacity: t.isVisible ? 1 : 0.5 }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                <span style={{ fontSize: '1.3rem' }}>𝕏</span>
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                                        ID: {t.tweetId}
                                        {t.label && (
                                            <span style={{ marginLeft: '8px', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: 'rgba(29,155,240,0.15)', color: '#1d9bf0' }}>{t.label}</span>
                                        )}
                                    </p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        {t.category} · Order: {t.sortOrder}
                                    </p>
                                </div>
                            </div>
                            <div className="post-item-actions">
                                <button onClick={() => toggleVisibility(t)} className="edit-btn" style={{ fontSize: '0.7rem' }}>{t.isVisible ? '👁' : '🚫'}</button>
                                <button onClick={() => startEdit(t)} className="edit-btn">Edit</button>
                                <button onClick={() => deleteTweet(t.id!)} className="delete-btn">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
