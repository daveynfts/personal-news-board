'use client';

import { useState } from 'react';
import AdminPosts from '@/components/AdminPosts';
import AdminArticles from '@/components/AdminArticles';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'articles'>('posts');
    const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const checkPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '123456A@a') {
            setIsAuthorized(true);
            addToast('Access granted. Welcome, Davey.');
        } else {
            addToast('Invalid credentials. Access denied.', 'error');
        }
    };

    if (!isAuthorized) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
                <div className="toast-container">
                    {toasts.map(toast => (
                        <div key={toast.id} className="toast" style={{ borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success-color)' : 'var(--error-color)'}` }}>
                            <div style={{ backgroundColor: toast.type === 'success' ? 'var(--success-color)' : 'var(--error-color)', width: '8px', height: '8px', borderRadius: '50%' }} />
                            {toast.message}
                        </div>
                    ))}
                </div>
                <div className="admin-card" style={{ width: '100%', maxWidth: '420px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔐</div>
                        <h2 style={{ fontSize: '1.6rem', marginBottom: '8px', margin: 0 }}>Security Gate</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>Restricted access. Authorized entities only.</p>
                    </div>
                    <form onSubmit={checkPassword} className="admin-form">
                        <div className="form-group">
                            <label>Internal Key</label>
                            <input
                                className="form-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your access key..."
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="submit-btn" style={{ marginTop: '8px' }}>🚀 Verify Identity</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className="toast" style={{ borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success-color)' : 'var(--error-color)'}` }}>
                        <div style={{ backgroundColor: toast.type === 'success' ? 'var(--success-color)' : 'var(--error-color)', width: '8px', height: '8px', borderRadius: '50%' }} />
                        {toast.message}
                    </div>
                ))}
            </div>

            <div className="admin-header-tabs trans-enter">
                <div className="app-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ paddingTop: '16px' }}>
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.3px', color: '#fff', margin: 0 }}>
                                🛸 DaveyNFTs <span style={{ color: 'var(--accent-color)' }}>Admin</span>
                            </h1>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Content Management Console</p>
                        </div>
                        <div className="admin-tabs" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0, paddingTop: '16px' }}>
                            <button
                                className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                📌 Short-form Curation
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'articles' ? 'active' : ''}`}
                                onClick={() => setActiveTab('articles')}
                            >
                                ✍️ Editorial Articles
                            </button>
                        </div>
                    </div>
                    <div style={{ borderBottom: '1px solid var(--border-color)', marginTop: '0' }} />
                </div>
            </div>

            <div className="app-container">
                {activeTab === 'posts' ? (
                    <AdminPosts addToast={addToast} />
                ) : (
                    <AdminArticles addToast={addToast} />
                )}
            </div>
        </div>
    );
}
