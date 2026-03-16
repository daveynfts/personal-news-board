'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminPosts from '@/components/AdminPosts';
import AdminArticles from '@/components/AdminArticles';
import AdminEvents from '@/components/AdminEvents';

const TOKEN_KEY = 'admin_session_token';
const STORAGE_TYPE_KEY = 'admin_session_storage'; // 'local' or 'session'

function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Check localStorage first (remember me), then sessionStorage
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string, rememberMe: boolean) {
    if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(STORAGE_TYPE_KEY, 'local');
        sessionStorage.removeItem(TOKEN_KEY);
    } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_TYPE_KEY);
    }
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_TYPE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true); // Loading state for auto-login
    const [activeTab, setActiveTab] = useState<'posts' | 'articles' | 'events'>('posts');
    const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    // Auto-login: check stored token on mount
    const verifyStoredToken = useCallback(async () => {
        const token = getStoredToken();
        if (!token) {
            setIsChecking(false);
            return;
        }

        try {
            const res = await fetch(`/api/auth?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (data.valid) {
                setIsAuthorized(true);
            } else {
                // Token expired or invalid — clear it
                clearToken();
            }
        } catch {
            clearToken();
        } finally {
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        verifyStoredToken();
    }, [verifyStoredToken]);

    const checkPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, rememberMe }),
            });
            if (res.ok) {
                const data = await res.json();
                storeToken(data.token, rememberMe);
                setIsAuthorized(true);
                addToast(rememberMe
                    ? 'Access granted. Session will persist for 30 days.'
                    : 'Access granted. Welcome, Davey.'
                );
            } else {
                addToast('Invalid credentials. Access denied.', 'error');
            }
        } catch {
            addToast('Authentication failed.', 'error');
        }
    };

    const handleLogout = () => {
        clearToken();
        setIsAuthorized(false);
        setPassword('');
        addToast('Session ended. You have been logged out.');
    };

    // Loading state — show skeleton while checking token
    if (isChecking) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
                <div className="admin-card" style={{ maxWidth: '420px', textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }}>🔐</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Verifying session...</p>
                </div>
            </div>
        );
    }

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

                        {/* Remember Me Toggle */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                marginTop: '4px',
                                borderRadius: '10px',
                                background: rememberMe ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${rememberMe ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.06)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                userSelect: 'none',
                            }}
                            onClick={() => setRememberMe(!rememberMe)}
                        >
                            <div
                                style={{
                                    width: '36px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    background: rememberMe
                                        ? 'linear-gradient(135deg, var(--accent-color), #818cf8)'
                                        : 'rgba(255,255,255,0.12)',
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    flexShrink: 0,
                                    boxShadow: rememberMe ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
                                }}
                            >
                                <div
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        background: '#fff',
                                        position: 'absolute',
                                        top: '2px',
                                        left: rememberMe ? '18px' : '2px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: rememberMe ? '#a5b4fc' : 'var(--text-secondary)',
                                    transition: 'color 0.3s ease',
                                    letterSpacing: '-0.01em',
                                }}>
                                    Remember Me
                                </span>
                                <span style={{
                                    fontSize: '0.68rem',
                                    color: 'var(--text-muted)',
                                    marginTop: '1px',
                                }}>
                                    {rememberMe ? 'Session persists for 30 days' : 'Session ends when browser closes'}
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '16px' }}>🚀 Verify Identity</button>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'rgba(255, 69, 58, 0.1)',
                                    border: '1px solid rgba(255, 69, 58, 0.25)',
                                    borderRadius: '8px',
                                    color: '#ff6b6b',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '6px 14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    letterSpacing: '0.03em',
                                    whiteSpace: 'nowrap',
                                }}
                                title="End session and log out"
                            >
                                ⏻ Logout
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
