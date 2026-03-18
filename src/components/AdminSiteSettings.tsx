'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { convertToWebP } from '@/lib/convertToWebP';

interface Props {
    addToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function AdminSiteSettings({ addToast }: Props) {
    const [avatarUrl, setAvatarUrl] = useState('');
    const [bubbleText, setBubbleText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch current settings
    useEffect(() => {
        fetch('/api/site-settings')
            .then(res => res.json())
            .then(data => {
                if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
                if (data.bubbleText) setBubbleText(data.bubbleText);
            })
            .catch(() => {});
    }, []);

    // Upload avatar
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        setUploading(true);
        try {
            const webpFile = await convertToWebP(file);
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(webpFile.name)}`, {
                method: 'POST',
                body: webpFile,
            });
            if (response.ok) {
                const blob = await response.json();
                setAvatarUrl(blob.url);
                // Save to DB immediately
                await fetch('/api/site-settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'avatarUrl', value: blob.url }),
                });
                addToast('Avatar updated successfully!');
            } else {
                addToast('Upload failed', 'error');
            }
        } catch (err: unknown) {
            addToast(`Error: ${err instanceof Error ? err.message : 'Unknown'}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    // Save bubble text
    const handleSaveBubbleText = async () => {
        setSaving(true);
        try {
            await fetch('/api/site-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'bubbleText', value: bubbleText }),
            });
            addToast('Thought bubble text saved!');
        } catch {
            addToast('Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-section trans-enter">
            <div className="admin-card" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>
                    ⚙️ Site Settings
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '32px' }}>
                    Manage your avatar and thought bubble content.
                </p>

                {/* Avatar Section */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
                        🖼️ Avatar
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '2px solid rgba(255,255,255,0.15)',
                            position: 'relative',
                            background: 'rgba(255,255,255,0.05)',
                            flexShrink: 0,
                        }}>
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Avatar"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    unoptimized
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    opacity: 0.3,
                                }}>
                                    👤
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="submit-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{ fontSize: '0.8rem', padding: '8px 20px' }}
                            >
                                {uploading ? '⏳ Uploading...' : '📤 Upload Avatar (1:1)'}
                            </button>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                Recommended: Square image (1:1 ratio). Will be converted to WebP.
                            </p>
                            {avatarUrl && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--accent-color)', marginTop: '4px', wordBreak: 'break-all' }}>
                                    {avatarUrl}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thought Bubble Section */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
                        💭 Thought Bubble
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        This text appears in a liquid glass bubble when users hover over your avatar.
                    </p>
                    <div className="form-group">
                        <label htmlFor="bubble-text">Bubble Content</label>
                        <textarea
                            id="bubble-text"
                            className="form-input"
                            value={bubbleText}
                            onChange={(e) => setBubbleText(e.target.value)}
                            placeholder="e.g. GM! 🌊 Welcome to my crypto universe. Here, I curate the best insights for you."
                            rows={3}
                            style={{ resize: 'vertical', minHeight: '80px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                        <button
                            className="submit-btn"
                            onClick={handleSaveBubbleText}
                            disabled={saving}
                            style={{ fontSize: '0.8rem', padding: '8px 24px' }}
                        >
                            {saving ? '⏳ Saving...' : '💾 Save Bubble Text'}
                        </button>
                        {bubbleText && (
                            <button
                                style={{
                                    background: 'rgba(255, 69, 58, 0.1)',
                                    border: '1px solid rgba(255, 69, 58, 0.25)',
                                    borderRadius: '8px',
                                    color: '#ff6b6b',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                }}
                                onClick={async () => {
                                    setBubbleText('');
                                    await fetch('/api/site-settings', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ key: 'bubbleText', value: '' }),
                                    });
                                    addToast('Bubble text cleared.');
                                }}
                            >
                                🗑️ Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview */}
                {bubbleText && (
                    <div style={{ marginTop: '40px', padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            👁️ Preview
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div className="thought-bubble" style={{ position: 'relative' }}>
                                <p>{bubbleText}</p>
                            </div>
                            <div className="thought-dots" style={{ flexDirection: 'column-reverse' }}>
                                <span className="thought-dot dot-1" style={{ opacity: 1 }} />
                                <span className="thought-dot dot-2" style={{ opacity: 1 }} />
                                <span className="thought-dot dot-3" style={{ opacity: 1 }} />
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '2px solid rgba(255,255,255,0.15)',
                                position: 'relative',
                            }}>
                                {avatarUrl ? (
                                    <Image src={avatarUrl} alt="Preview" fill style={{ objectFit: 'cover' }} unoptimized />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
