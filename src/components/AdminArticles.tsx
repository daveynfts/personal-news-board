'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { convertToWebP } from '@/lib/convertToWebP';
import ImageCropperModal from './ImageCropperModal';

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
        }
    };

    const handleCropCancel = () => {
        if (cropFile) {
            URL.revokeObjectURL(cropFile.src);
        }
        setCropFile(null);
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
                    <div className="apple-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '24px' }}>🗑️</div>
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '12px', fontWeight: 900, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Delete Article?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '1.05rem', lineHeight: 1.5 }}>
                            You are about to permanently delete <br/>
                            <strong style={{ color: '#fff' }}>&quot;{showConfirm.title}&quot;</strong>
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>This action cannot be undone.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button className="edit-btn" style={{ padding: '16px' }} onClick={() => setShowConfirm(null)}>Cancel</button>
                            <button className="submit-btn" style={{ background: '#ff453a', color: '#fff', padding: '16px', marginTop: 0 }} onClick={handleDelete} disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete'}
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
                    <div className="admin-card-icon">✍️</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{editingId ? 'Edit Article' : 'Write Article'}</h2>
                        {editingId && <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Session</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

                        <div className="form-group">
                            <label>Cover Image (16:9)</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    className="form-input"
                                    type="url"
                                    value={coverImage}
                                    onChange={(e) => setCoverImage(e.target.value)}
                                    placeholder="Image URL..."
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="article-file-upload"
                                    disabled={uploading}
                                />
                                <label htmlFor="article-file-upload" className="edit-btn" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    {uploading ? '⏳' : '↑ Upload'}
                                </label>
                            </div>
                            {coverImage && coverImage.startsWith('http') && (
                                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                                    <img src={coverImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', padding: '4px 8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
                                        Preview
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`editorial-toggle-container ${isEditorialPick ? 'active' : ''}`}>
                            <label>
                                <input
                                    type="checkbox"
                                    className="editorial-toggle-checkbox"
                                    checked={isEditorialPick}
                                    onChange={(e) => setIsEditorialPick(e.target.checked)}
                                />
                                <div>
                                    <span style={{ fontWeight: 800, color: isEditorialPick ? 'var(--accent-color)' : '#fff', fontSize: '1rem', letterSpacing: '-0.02em' }}>
                                        ★ Editorial Pick
                                    </span>
                                    <p style={{ fontSize: '0.8rem', color: isEditorialPick ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
                                        Push to featured hero carousel
                                    </p>
                                </div>
                            </label>
                        </div>


                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={{ margin: 0 }}>Content Body (Markdown)</label>
                                <button
                                    type="button"
                                    className="edit-btn"
                                    onClick={() => setPreviewMode(!previewMode)}
                                    style={{ padding: '4px 12px', fontSize: '0.7rem' }}
                                >
                                    {previewMode ? '◧ Hide Preview' : '▣ Show Preview'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <textarea
                                    className="form-input"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your story..."
                                    rows={12}
                                    style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6 }}
                                />
                                {previewMode && (
                                    <div className="manage-container" style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                                        <div className="article-body" style={{ fontSize: '0.95rem' }}>
                                            <ReactMarkdown>{content || '*Preview will appear here...*'}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                            <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 1 }}>
                                {loading ? '⏳ Processing...' : editingId ? '✓ Save Changes' : '🚀 Publish Article'}
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
                            {articles.length} Published Pieces
                        </p>
                    </div>
                    <button onClick={async () => { await fetchArticles(); addToast('Library synced.'); }} className="edit-btn" style={{ fontSize: '0.75rem' }}>↻ Sync</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {articles.length === 0 ? (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
                            <p>No articles yet.</p>
                        </div>
                    ) : (
                        articles.map((article) => (
                            <div key={article.id} className="post-item-admin">
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                                    {article.isEditorialPick && (
                                        <span className="status-badge going" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>★ PICK</span>
                                    )}
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', margin: 0 }}>
                                            {article.title}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                            {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Syncing...'}
                                        </p>
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
