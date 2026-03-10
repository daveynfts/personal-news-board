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
            <div className="admin-page-layout" style={{ justifyContent: 'center', minHeight: '80vh' }}>
                <div className="toast-container">
                    {toasts.map(toast => (
                        <div key={toast.id} className="toast" style={{ borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success-color)' : 'var(--error-color)'}` }}>
                            <div style={{ backgroundColor: toast.type === 'success' ? 'var(--success-color)' : 'var(--error-color)', width: '8px', height: '8px', borderRadius: '50%' }} />
                            {toast.message}
                        </div>
                    ))}
                </div>
                <div className="admin-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Security Gate</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Restricted access for authorized entities only.</p>
                    </div>
                    <form onSubmit={checkPassword} className="admin-form">
                        <div className="form-group">
                            <label>Internal Key</label>
                            <input
                                className="form-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn" style={{ marginTop: '0' }}>Verify Identity</button>
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
                    <div className="admin-tabs">
                        <button
                            className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            Short-form Curation (Posts & Links)
                        </button>
                        <button
                            className={`admin-tab ${activeTab === 'articles' ? 'active' : ''}`}
                            onClick={() => setActiveTab('articles')}
                        >
                            Editorial Articles (Long-form)
                        </button>
                    </div>
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
