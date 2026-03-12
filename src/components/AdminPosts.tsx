'use client';

import { useState, useEffect, useCallback } from 'react';
import { convertToWebP } from '@/lib/convertToWebP';
import ImageCropperModal from './ImageCropperModal';

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
    const [cropFile, setCropFile] = useState<{ src: string, file: File } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show cropper first
        const objUrl = URL.createObjectURL(file);
        setCropFile({ src: objUrl, file });
        
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const handleCropComplete = async (croppedFile: File) => {
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
        }
    };

    const handleCropCancel = () => {
        if (cropFile) {
            URL.revokeObjectURL(cropFile.src);
        }
        setCropFile(null);
    };

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch {
            addToast('Failed to sync posts.', 'error');
        }
    }, [addToast]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

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
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🗑️</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 900 }}>Remove Post?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '1rem', lineHeight: 1.5 }}>
                            You are about to remove <br/>
                            <strong style={{ color: '#fff' }}>&quot;{showConfirm.title}&quot;</strong>
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '32px' }}>This action cannot be undone.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button className="edit-btn" style={{ padding: '14px' }} onClick={() => setShowConfirm(null)}>Cancel</button>
                            <button className="submit-btn" style={{ background: '#ff453a', color: '#fff', padding: '14px' }} onClick={handleDelete} disabled={loading}>
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
                    aspectRatio={16 / 9}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            {/* LEFT: FORM */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <div className="admin-card-icon">📌</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{editingId ? 'Edit Post' : 'Add New Post'}</h2>
                        {editingId && <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Session</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="form-group">
                            <label>Category</label>
                            <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="News">📰 News Report</option>
                                <option value="Blog">✍️ Deep Dive</option>
                                <option value="X">𝕏 Intelligence</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Headline</label>
                            <input
                                className="form-input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Headline of the story..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Source URL</label>
                            <input
                                className="form-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Cover Image (16:9)</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    className="form-input"
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Image URL..."
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="post-file-upload"
                                    disabled={uploading}
                                />
                                <label htmlFor="post-file-upload" className="edit-btn" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    {uploading ? '⏳' : '↑ Upload'}
                                </label>
                            </div>

                            {imageUrl && imageUrl.startsWith('http') && (
                                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                                    <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
                                        Preview
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                            <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 1 }}>
                                {loading ? '⏳ Processing...' : editingId ? '✓ Save Changes' : '🚀 Publish to Feed'}
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

            {/* RIGHT: ARCHIVE */}
            <div className="manage-container">
                <div className="manage-header">
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Archive</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                            {posts.length} Curated Entries
                        </p>
                    </div>
                    <button onClick={async () => { await fetchPosts(); addToast('Database synced.'); }} className="edit-btn" style={{ fontSize: '0.75rem' }}>↻ Sync</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {posts.length === 0 ? (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                            <p>Feed is currently empty.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="post-item-admin">
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                                    <span className="status-badge" style={{
                                        background: post.type === 'X' ? 'var(--x-color)' : post.type === 'News' ? 'var(--news-color)' : 'var(--blog-color)',
                                        color: post.type === 'X' ? '#fff' : '#000',
                                        fontSize: '0.65rem',
                                        padding: '4px 8px'
                                    }}>{post.type}</span>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', margin: 0 }}>
                                            {post.title}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Syncing...'}
                                        </p>
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
