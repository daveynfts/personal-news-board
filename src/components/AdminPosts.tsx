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
                addToast('Image uploaded successfully.');
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
            addToast('Failed to sync posts.', 'error');
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
        if (!title.trim() || !url.trim()) {
            addToast('Headline and URL are required.', 'error');
            return;
        }
        setLoading(true);

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId
                ? { id: editingId, type, title, url, imageUrl }
                : { type, title, url, imageUrl };

            const res = await fetch('/api/posts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                addToast(editingId ? 'Post updated successfully.' : 'Post published to the feed.');
                resetForm();
                fetchPosts();
            } else {
                const data = await res.json();
                addToast(data.error || 'Publication failed.', 'error');
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
            const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Post removed from curation.');
                fetchPosts();
            } else {
                addToast('Failed to remove post.', 'error');
            }
        } catch (err: unknown) {
            addToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
        } finally {
            setLoading(false);
            setShowConfirm(null);
        }
    };

    const typeColors: Record<string, string> = {
        News: 'var(--news-color)',
        Blog: 'var(--blog-color)',
        X: 'var(--x-color)',
    };

    return (
        <div className="admin-page-layout trans-enter">

            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🗑️</div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: 900 }}>Remove Post?</h3>
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
                    <div className="admin-card-icon">📌</div>
                    <div>
                        <h2>{editingId ? 'Edit Post' : 'Add New Post'}</h2>
                        {editingId && <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Editing Mode</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">

                    <div className="form-section">
                        <div className="form-section-title">Content Details</div>

                        <div className="form-group">
                            <label>Category</label>
                            <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="News">📰 News Report</option>
                                <option value="Blog">✍️ Blog / Deep Dive</option>
                                <option value="X">𝕏 X / Twitter Thread</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Headline</label>
                            <input
                                className="form-input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Write an engaging headline..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Source URL</label>
                            <input
                                className="form-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/article"
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
                            id="post-file-upload"
                            disabled={uploading}
                        />
                        <label htmlFor="post-file-upload" className="upload-btn">
                            {uploading ? (
                                <><span>⏳</span> Converting & uploading...</>
                            ) : (
                                <><span>↑</span> Upload from device (auto-converts to WebP)</>
                            )}
                        </label>

                        {imageUrl && imageUrl.startsWith('http') && (
                            <div className="url-preview">
                                ✓ Image ready: {imageUrl.length > 50 ? imageUrl.substring(0, 50) + '...' : imageUrl}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 2 }}>
                            {loading ? '⏳ Saving...' : editingId ? '✓ Update Post' : '🚀 Publish Post'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="btn-outline" style={{ marginTop: 0 }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* RIGHT: ARCHIVE */}
            <div className="manage-container">
                <div className="manage-header">
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Curation Archive</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {posts.length} {posts.length === 1 ? 'post' : 'posts'} in your feed
                        </p>
                    </div>
                    <button onClick={fetchPosts} className="filter-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>↻ Sync</button>
                </div>

                <div>
                    {posts.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px 40px', textAlign: 'center', opacity: 0.5 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                            <p style={{ color: 'var(--text-secondary)' }}>No posts yet. Publish your first one!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="post-item-admin">
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <span style={{
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        background: typeColors[post.type] || 'var(--accent-color)',
                                        color: post.type === 'X' ? '#fff' : '#000',
                                        flexShrink: 0,
                                    }}>{post.type}</span>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', margin: 0 }}>
                                            {post.title}
                                        </p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </span>
                                    </div>
                                </div>
                                <div className="post-item-actions">
                                    <button onClick={() => startEditing(post)} className="edit-btn">Edit</button>
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
