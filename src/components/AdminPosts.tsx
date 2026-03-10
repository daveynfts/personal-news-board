'use client';

import { useState, useEffect } from 'react';
import { convertToWebP } from '@/lib/convertToWebP';

interface Post {
    id: number;
    type: string;
    title: string;
    url: string;
    imageUrl?: string;
    createdAt?: string;
}

interface AdminPostsProps {
    addToast: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminPosts({ addToast }: AdminPostsProps) {
    const [type, setType] = useState('News');
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ id: number; title: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const webpFile = await convertToWebP(file);
            const response = await fetch(`/api/upload?filename=${webpFile.name}`, {
                method: 'POST',
                body: webpFile,
            });

            if (response.ok) {
                const blob = await response.json();
                setImageUrl(blob.url);
                addToast('Image uploaded to Vercel Blob.');
            } else {
                addToast('Upload failed.', 'error');
            }
        } catch (error) {
            addToast('Error uploading file.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            addToast('Failed to sync with the matrix.', 'error');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setType('News');
        setTitle('');
        setUrl('');
        setImageUrl('');
    };

    const startEditing = (post: Post) => {
        setEditingId(post.id);
        setType(post.type);
        setTitle(post.title);
        setUrl(post.url);
        setImageUrl(post.imageUrl || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const actionLabel = editingId ? 'Updating...' : 'Publishing...';

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId
                ? { id: editingId, type, title, url, imageUrl }
                : { type, title, url, imageUrl };

            const res = await fetch('/api/posts', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                addToast(editingId ? 'Data structure updated successfully.' : 'Curation published to the feed.');
                resetForm();
                fetchPosts();
            } else {
                const data = await res.json();
                addToast(data.error || 'System override failed.', 'error');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                addToast(err.message, 'error');
            } else {
                addToast('An unknown error occurred.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showConfirm) return;
        const id = showConfirm.id;

        try {
            const res = await fetch(`/api/posts?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                addToast('Target eliminated from curation.');
                fetchPosts();
            } else {
                addToast('Failed to remove the target.', 'error');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                addToast(err.message, 'error');
            } else {
                addToast('An unknown error occurred.', 'error');
            }
        } finally {
            setLoading(false);
            setShowConfirm(null);
        }
    };

    const handleDeleteClick = () => {
        setLoading(true);
        handleDelete();
    };

    return (
        <div className="admin-page-layout trans-enter">

            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Terminal Confirmation</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                            Are you certain you want to remove <br />
                            <span style={{ color: '#fff', fontWeight: 700 }}>&quot;{showConfirm.title}&quot;</span>? <br />
                            This action is irreversible.
                        </p>
                        <div className="btn-group">
                            <button className="btn-secondary" onClick={() => setShowConfirm(null)}>Abort</button>
                            <button className="btn-danger" onClick={handleDeleteClick} disabled={loading}>
                                {loading ? 'Eliminating...' : 'Confirm Removal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h2 style={{ margin: 0 }}>{editingId ? 'Refine Content' : 'Publish Asset'}</h2>
                        {editingId && <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Editing Active Session</span>}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Asset Class</label>
                        <select
                            className="form-input"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        >
                            <option value="News">News Report</option>
                            <option value="Blog">Deep Dive Blog</option>
                            <option value="X">X Insights</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Headline</label>
                        <input
                            className="form-input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a compelling title..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Target URL</label>
                        <input
                            className="form-input"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://original-source.com/..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Image Source</label>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <input
                                className="form-input"
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="External URL (https://...)"
                            />
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="post-file-upload"
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor="post-file-upload"
                                    className="btn-outline"
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        padding: '10px',
                                        opacity: uploading ? 0.6 : 1
                                    }}
                                >
                                    {uploading ? 'Uploading to Blob...' : '↑ Upload Image File'}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 2 }}>
                            {editingId ? 'Update Database' : (loading ? 'Syncing...' : 'Secure Publication')}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="btn-outline" style={{ marginTop: '12px' }}>Cancel</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="manage-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ margin: 0 }}>Curation Manager</h2>
                    <button onClick={fetchPosts} className="filter-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Sync List</button>
                </div>
                <div className="admin-posts-list">
                    {posts.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px', opacity: 0.5 }}>
                            <p>Deciphering feed data...</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="post-item-admin">
                                <div className="admin-post-info" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span className="type-tag" style={{
                                        position: 'static',
                                        backgroundColor: post.type === 'X' ? 'var(--x-color)' : post.type === 'News' ? 'var(--news-color)' : 'var(--blog-color)',
                                        padding: '4px 10px',
                                        fontSize: '0.7rem'
                                    }}>{post.type}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                                        <strong style={{ fontSize: '1.05rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#fff' }}>{post.title}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Syncing...'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => startEditing(post)} className="filter-btn" style={{ padding: '10px 18px', borderRadius: '12px', background: 'var(--surface-hover)', fontSize: '0.8rem' }}>Edit</button>
                                    <button onClick={() => setShowConfirm({ id: post.id, title: post.title })} className="delete-btn">Remove</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
