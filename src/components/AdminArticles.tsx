'use client';

import { useState, useEffect } from 'react';
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

    useEffect(() => {
        fetchArticles();
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
                setCoverImage(blob.url);
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

    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/articles');
            const data = await res.json();
            setArticles(Array.isArray(data) ? data : []);
        } catch (err) {
            addToast('Failed to sync articles', 'error');
        }
    };

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
                addToast('Article deleted entirely.');
                fetchArticles();
            } else {
                addToast('Failed to delete article.', 'error');
            }
        } catch (err) {
            addToast('An error occurred.', 'error');
        } finally {
            setLoading(false);
            setShowConfirm(null);
        }
    };

    return (
        <div className="admin-tab-content trans-enter">
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Delete Article</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                            Are you certain you want to remove <br />
                            <span style={{ color: '#fff', fontWeight: 700 }}>&quot;{showConfirm.title}&quot;</span>? <br />
                            This action is irreversible.
                        </p>
                        <div className="btn-group">
                            <button className="btn-secondary" onClick={() => setShowConfirm(null)}>Abort</button>
                            <button className="btn-danger" onClick={handleDelete} disabled={loading}>
                                {loading ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h2 style={{ margin: 0 }}>{editingId ? 'Refine Article' : 'Draft New Article'}</h2>
                        {editingId && <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Editing Active Article</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Headline / Title</label>
                        <input
                            className="form-input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Type an engaging title..."
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label>Cover Image</label>
                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                <input
                                    className="form-input"
                                    type="url"
                                    value={coverImage}
                                    onChange={(e) => setCoverImage(e.target.value)}
                                    placeholder="External URL (https://...)"
                                />
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="article-file-upload"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="article-file-upload"
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

                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', background: 'var(--surface-color)', padding: '16px', borderRadius: '12px' }}>
                        <input
                            type="checkbox"
                            id="editorialPick"
                            checked={isEditorialPick}
                            onChange={(e) => setIsEditorialPick(e.target.checked)}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="editorialPick" style={{ marginBottom: 0, cursor: 'pointer', color: '#fff' }}>Editorial Pick</label>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Feature this article prominently in the hero carousel</span>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ margin: 0 }}>Article Body (Markdown Supported)</label>
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => setPreviewMode(!previewMode)}
                                style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                            >
                                {previewMode ? 'Hide Preview' : 'Show Preview'}
                            </button>
                        </div>

                        <div className={`editor-container ${previewMode ? 'split' : ''}`}>
                            <textarea
                                className="form-input markdown-input"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your article here using Markdown..."
                                required
                                rows={15}
                            />
                            {previewMode && (
                                <div className="markdown-preview">
                                    <ReactMarkdown>{content || '*Preview will appear here...*'}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 2 }}>
                            {editingId ? 'Update Article' : (loading ? 'Publishing...' : 'Publish Article')}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="btn-outline" style={{ marginTop: '12px' }}>Cancel</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="manage-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ margin: 0 }}>Article Archive</h2>
                    <button onClick={fetchArticles} className="filter-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Sync</button>
                </div>
                <div className="admin-posts-list">
                    {articles.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px', opacity: 0.5 }}>
                            <p>No articles drafted yet.</p>
                        </div>
                    ) : (
                        articles.map((article) => (
                            <div key={article.id} className="post-item-admin">
                                <div className="admin-post-info" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {article.isEditorialPick && (
                                        <span className="type-tag" style={{ background: 'var(--accent-color)', color: '#000', fontWeight: 800, padding: '4px 8px', fontSize: '0.7rem' }}>★ PICK</span>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                                        <strong style={{ fontSize: '1.05rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#fff' }}>{article.title}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Syncing...'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => startEditing(article)} className="filter-btn" style={{ padding: '10px 18px', borderRadius: '12px', background: 'var(--surface-hover)', fontSize: '0.8rem' }}>Edit</button>
                                    <button onClick={() => setShowConfirm({ id: article.id, title: article.title })} className="delete-btn">Remove</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
