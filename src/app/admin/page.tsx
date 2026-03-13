'use client';

import { useState } from 'react';
import AdminPosts from '@/components/AdminPosts';
import AdminArticles from '@/components/AdminArticles';
import AdminEvents from '@/components/AdminEvents';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'articles' | 'events'>('posts');
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
                <div className="admin-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔐</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>Security Gate</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Authorized entities only. Enter access key.</p>
                    </div>
                    <form onSubmit={checkPassword} className="admin-form">
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label htmlFor="admin-password">Internal Key</label>
                            <input
                                id="admin-password"
                                className="form-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoFocus
                                autoComplete="current-password"
                            />
                        </div>
                        <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '8px' }}>🚀 Verify Identity</button>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                        <div>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#fff', margin: 0 }}>
                                🛸 DaveyNFTs <span style={{ color: 'var(--accent-color)' }}>Admin</span>
                            </h1>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Management Console</p>
                        </div>
                        <div className="admin-tabs">
                            <button
                                className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                📌 Posts
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'articles' ? 'active' : ''}`}
                                onClick={() => setActiveTab('articles')}
                            >
                                ✍️ Editorial
                            </button>
                            <button
                                className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
                                onClick={() => setActiveTab('events')}
                            >
                                📅 Events
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="app-container">
                {activeTab === 'posts' && <AdminPosts addToast={addToast} />}
                {activeTab === 'articles' && <AdminArticles addToast={addToast} />}
                {activeTab === 'events' && <AdminEvents addToast={addToast} />}
            </div>
        </div>
    );
}
