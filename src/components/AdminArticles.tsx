'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { convertToWebP } from '@/lib/convertToWebP';

interface Article {
    id: number;
    title: string;
    content: string;
    coverImage?: string;
    xSourceUrl?: string;
    isEditorialPick: boolean;
    createdAt?: string;
}

interface AdminArticlesProps {
    addToast: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminArticles({ addToast }: AdminArticlesProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [xSourceUrl, setXSourceUrl] = useState('');
    const [isEditorialPick, setIsEditorialPick] = useState(false);

    const [articles, setArticles] = useState<Article[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ id: number; title: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewMode, setPreviewMode] = useState(true);

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
                setCoverImage(blob.url);
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

    const fetchArticles = useCallback(async () => {
        try {
            const res = await fetch('/api/articles');
            const data = await res.json();
            setArticles(Array.isArray(data) ? data : []);
        } catch {
            addToast('Failed to sync articles', 'error');
        }
    }, [addToast]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
        setCoverImage('');
        setXSourceUrl('');
        setIsEditorialPick(false);
    };

    const startEditing = (article: Article) => {
        setEditingId(article.id);
        setTitle(article.title);
        setContent(article.content);
        setCoverImage(article.coverImage || '');
        setXSourceUrl(article.xSourceUrl || '');
        setIsEditorialPick(article.isEditorialPick);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!title.trim() || !content.trim()) {
            addToast('Title and content are required.', 'error');
            setLoading(false);
            return;
        }

        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/articles/${editingId}` : '/api/articles';
            const body = { title, content, coverImage, xSourceUrl, isEditorialPick };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                addToast(editingId ? 'Article updated successfully.' : 'Article published successfully.');
                resetForm();
                fetchArticles();
            } else {
                const data = await res.json();
                addToast(data.error || 'Failed to publish article.', 'error');
            }
        } catch (err: unknown) {
            addToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showConfirm) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/articles/${showConfirm.id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Article deleted.');
                fetchArticles();
            } else {
                addToast('Failed to delete article.', 'error');
            }
        } catch {
            addToast('An error occurred.', 'error');
        } finally {
            setLoading(false);
            setShowConfirm(null);
        }
    };

    return (
        <div className="admin-page-layout trans-enter">
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🗑️</div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: 900 }}>Delete Article?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.95rem' }}>
                            You are about to permanently delete:
                        </p>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
                            &quot;{showConfirm.title}&quot;
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>This action cannot be undone.</p>
                        <div className="btn-group">
                            <button className="btn-secondary" onClick={() => setShowConfirm(null)}>Cancel</button>
                            <button className="btn-danger" onClick={handleDelete} disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT: FORM */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <div className="admin-card-icon">✍️</div>
                    <div>
                        <h2>{editingId ? 'Edit Article' : 'Write Article'}</h2>
                        {editingId && <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Editing Mode</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">

                    <div className="form-section">
                        <div className="form-section-title">Article Info</div>
                        <div className="form-group">
                            <label>Headline / Title</label>
                            <input
                                className="form-input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Write an engaging title..."
                            />
                        </div>
                        <div className="form-group">
                            <label>X (Twitter) Source URL</label>
                            <input
                                className="form-input"
                                type="url"
                                value={xSourceUrl}
                                onChange={(e) => setXSourceUrl(e.target.value)}
                                placeholder="https://x.com/..."
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-title">Cover Image (16:9 recommended)</div>
                        <div className="form-group">
                            <label>Image URL</label>
                            <input
                                className="form-input"
                                type="url"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="article-file-upload"
                            disabled={uploading}
                        />
                        <label htmlFor="article-file-upload" className="upload-btn">
                            {uploading ? (
                                <><span>⏳</span> Converting & uploading...</>
                            ) : (
                                <><span>↑</span> Upload from device (auto-converts to WebP)</>
                            )}
                        </label>
                        {coverImage && coverImage.startsWith('http') && (
                            <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                                <img src={coverImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px', fontSize: '0.7rem', color: '#fff' }}>
                                    16:9 Preview
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-section" style={{ background: isEditorialPick ? 'rgba(243, 186, 47, 0.05)' : undefined, borderColor: isEditorialPick ? 'rgba(243, 186, 47, 0.3)' : undefined }}>
                        <div className="form-section-title">Feature Settings</div>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                            padding: '4px 0'
                        }}>
                            <input
                                type="checkbox"
                                id="editorialPick"
                                checked={isEditorialPick}
                                onChange={(e) => setIsEditorialPick(e.target.checked)}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer', flexShrink: 0 }}
                            />
                            <div>
                                <span style={{ fontWeight: 800, color: isEditorialPick ? 'var(--accent-color)' : '#fff', fontSize: '0.9rem' }}>
                                    ★ Editorial Pick
                                </span>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                                    Feature this article in the hero carousel on the main site
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="form-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div className="form-section-title" style={{ margin: 0 }}>Article Body</div>
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => setPreviewMode(!previewMode)}
                                style={{ padding: '4px 12px', fontSize: '0.75rem', marginBottom: 0 }}
                            >
                                {previewMode ? '◧ Hide Preview' : '▣ Show Preview'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                            Supports Markdown: **bold**, *italic*, # Heading, [link](url), ![img](url)
                        </p>

                        <div className={`editor-container ${previewMode ? 'split' : ''}`}>
                            <textarea
                                className="form-input markdown-input"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your article here using Markdown..."
                                rows={15}
                            />
                            {previewMode && (
                                <div className="markdown-preview">
                                    <ReactMarkdown>{content || '*Preview will appear here...*'}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 2 }}>
                            {loading ? '⏳ Saving...' : editingId ? '✓ Update Article' : '🚀 Publish Article'}
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
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Article Archive</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {articles.length} {articles.length === 1 ? 'article' : 'articles'} published
                        </p>
                    </div>
                    <button onClick={fetchArticles} className="filter-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>↻ Sync</button>
                </div>

                <div>
                    {articles.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px 40px', textAlign: 'center', opacity: 0.5 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📝</div>
                            <p style={{ color: 'var(--text-secondary)' }}>No articles yet. Write your first one!</p>
                        </div>
                    ) : (
                        articles.map((article) => (
                            <div key={article.id} className="post-item-admin">
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    {article.isEditorialPick && (
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            background: 'var(--accent-color)',
                                            color: '#000',
                                            flexShrink: 0,
                                            letterSpacing: '0.5px',
                                        }}>★ PICK</span>
                                    )}
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', margin: 0 }}>
                                            {article.title}
                                        </p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </span>
                                    </div>
                                </div>
                                <div className="post-item-actions">
                                    <button onClick={() => startEditing(article)} className="edit-btn">Edit</button>
                                    <button onClick={() => setShowConfirm({ id: article.id, title: article.title })} className="delete-btn">Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
