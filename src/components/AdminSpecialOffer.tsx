'use client';

import { useState, useEffect, useCallback } from 'react';
import { convertToWebP } from '@/lib/convertToWebP';
import Image from 'next/image';

interface Exchange {
    id?: number;
    name: string;
    badge: string;
    badgeColor: string;
    bonus: string;
    gradient: string;
    glowColor: string;
    logo: string;
    features: string;
    link: string;
    sortOrder: number;
    isVisible: boolean;
}

interface CryptoEvent {
    id?: number;
    platform: string;
    platformIcon: string;
    platformColor: string;
    eventType: string;
    tokenSymbol: string;
    tokenName: string;
    description: string;
    status: string;
    endDate: string;
    totalRewards: string;
    stakingAssets: string;
    apr: string;
    tags: string;
    ctaLink: string;
    sortOrder: number;
    isVisible: boolean;
}

interface Props {
    addToast: (message: string, type?: 'success' | 'error') => void;
}

// ── Color Presets ──
const gradientPresets = [
    { label: 'Binance Gold', value: 'linear-gradient(135deg, #f0b90b 0%, #d4a20a 50%, #b8890a 100%)', preview: 'linear-gradient(135deg, #f0b90b, #b8890a)' },
    { label: 'Bybit Orange', value: 'linear-gradient(135deg, #f7a600 0%, #ff6b00 50%, #e85d00 100%)', preview: 'linear-gradient(135deg, #f7a600, #e85d00)' },
    { label: 'OKX Teal', value: 'linear-gradient(135deg, #00d4aa 0%, #00b894 50%, #009d80 100%)', preview: 'linear-gradient(135deg, #00d4aa, #009d80)' },
    { label: 'Purple Haze', value: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #ec4899 100%)', preview: 'linear-gradient(135deg, #a855f7, #ec4899)' },
    { label: 'Ocean Blue', value: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)', preview: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { label: 'Emerald', value: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)', preview: 'linear-gradient(135deg, #10b981, #047857)' },
    { label: 'Rose', value: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)', preview: 'linear-gradient(135deg, #f43f5e, #be123c)' },
    { label: 'Sunset', value: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)', preview: 'linear-gradient(135deg, #f59e0b, #ec4899)' },
];

const glowPresets = [
    { label: 'Gold', value: 'rgba(240, 185, 11, 0.3)', dot: '#f0b90b' },
    { label: 'Orange', value: 'rgba(247, 166, 0, 0.3)', dot: '#f7a600' },
    { label: 'Teal', value: 'rgba(0, 212, 170, 0.3)', dot: '#00d4aa' },
    { label: 'Purple', value: 'rgba(168, 85, 247, 0.3)', dot: '#a855f7' },
    { label: 'Blue', value: 'rgba(59, 130, 246, 0.3)', dot: '#3b82f6' },
    { label: 'Green', value: 'rgba(16, 185, 129, 0.3)', dot: '#10b981' },
    { label: 'Rose', value: 'rgba(244, 63, 94, 0.3)', dot: '#f43f5e' },
    { label: 'White', value: 'rgba(255, 255, 255, 0.15)', dot: '#ffffff' },
];

// ── URL validation helper ──
function isValidUrl(str: string): boolean {
    if (!str || str.length < 10) return false;
    try { const u = new URL(str); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
}

const defaultExchange: Omit<Exchange, 'id'> = {
    name: '', badge: '', badgeColor: '#f0b90b', bonus: '',
    gradient: gradientPresets[0].value,
    glowColor: glowPresets[0].value, logo: '',
    features: '[]', link: '', sortOrder: 0, isVisible: true,
};

const defaultEvent: Omit<CryptoEvent, 'id'> = {
    platform: 'Binance', platformIcon: '', platformColor: '#f0b90b',
    eventType: 'Launchpool', tokenSymbol: '', tokenName: '', description: '',
    status: 'upcoming', endDate: '', totalRewards: '', stakingAssets: '[]',
    apr: '', tags: '[]', ctaLink: '', sortOrder: 0, isVisible: true,
};

// ── Reusable sub-components ──

function ImageUploadField({ label, value, onChange, addToast }: { label: string; value: string; onChange: (url: string) => void; addToast: Props['addToast'] }) {
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        setUploading(true);
        try {
            const webpFile = await convertToWebP(file);
            const res = await fetch(`/api/upload?filename=${encodeURIComponent(webpFile.name)}`, { method: 'POST', body: webpFile });
            if (res.ok) {
                const blob = await res.json();
                onChange(blob.url);
                addToast('Image uploaded.');
            } else { addToast('Upload failed.', 'error'); }
        } catch { addToast('Upload error.', 'error'); }
        finally { setUploading(false); }
    };

    const inputId = `img-upload-${label.replace(/\s/g, '-').toLowerCase()}`;
    const isValid = isValidUrl(value);

    return (
        <div className="form-group">
            <label>{label} <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>(1:1 ratio recommended)</span></label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: isValid ? '10px' : 0 }}>
                <input className="form-input" type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Image URL or upload..." style={{ flex: 1 }} />
                <input type="file" onChange={handleFile} accept="image/*" style={{ display: 'none' }} id={inputId} disabled={uploading} />
                <label htmlFor={inputId} className="edit-btn" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '6px 14px' }}>
                    {uploading ? '⏳' : '↑ Upload'}
                </label>
            </div>
            {isValid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#111' }}>
                        <Image src={value} alt={label} fill style={{ objectFit: 'cover' }} unoptimized />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{value}</span>
                    <button type="button" onClick={() => onChange('')} className="delete-btn" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>✕</button>
                </div>
            )}
        </div>
    );
}

function GradientPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="form-group">
            <label>CTA Gradient</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {gradientPresets.map(p => (
                    <button key={p.label} type="button" title={p.label}
                        onClick={() => onChange(p.value)}
                        style={{
                            width: '36px', height: '24px', borderRadius: '8px', border: value === p.value ? '2px solid #fff' : '2px solid rgba(255,255,255,0.12)',
                            background: p.preview, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: value === p.value ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
                        }}
                    />
                ))}
            </div>
            <input className="form-input" value={value} onChange={e => onChange(e.target.value)} placeholder="linear-gradient(135deg, ...)" style={{ fontSize: '0.8rem' }} />
        </div>
    );
}

function GlowPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="form-group">
            <label>Glow Color</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {glowPresets.map(p => (
                    <button key={p.label} type="button" title={p.label}
                        onClick={() => onChange(p.value)}
                        style={{
                            width: '28px', height: '28px', borderRadius: '50%', border: value === p.value ? '2px solid #fff' : '2px solid rgba(255,255,255,0.12)',
                            background: p.dot, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: value === p.value ? `0 0 10px ${p.dot}50` : 'none',
                        }}
                    />
                ))}
            </div>
            <input className="form-input" value={value} onChange={e => onChange(e.target.value)} placeholder="rgba(240, 185, 11, 0.3)" style={{ fontSize: '0.8rem' }} />
        </div>
    );
}

// ── Exchange Preview Card ──
function ExchangePreview({ form, features }: { form: Omit<Exchange, 'id'>; features: string }) {
    const feats = features.split(',').map(s => s.trim()).filter(Boolean);
    if (!form.name) return null;
    return (
        <div style={{ marginTop: '16px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', marginBottom: '12px' }}>📱 Live Preview</div>
            <div style={{ position: 'relative', padding: '24px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: `radial-gradient(ellipse at 50% 0%, ${form.glowColor}, transparent 70%)`, pointerEvents: 'none' }} />
                {form.badge && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '3px 10px', borderRadius: '999px', background: form.badgeColor, color: '#000', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}>{form.badge}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
                    {isValidUrl(form.logo) ? (
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#111' }}>
                            <Image src={form.logo} alt={form.name} fill style={{ objectFit: 'cover' }} unoptimized />
                        </div>
                    ) : (
                        <span style={{ fontSize: '1.8rem' }}>{form.logo || '🟡'}</span>
                    )}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#fff' }}>{form.name}</h3>
                </div>
                {form.bonus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                        <span>🎁</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0b90b' }}>{form.bonus}</span>
                    </div>
                )}
                {feats.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {feats.map((f, i) => (
                            <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span> {f}
                            </li>
                        ))}
                    </ul>
                )}
                <div style={{ padding: '12px 20px', borderRadius: '999px', background: form.gradient, color: '#fff', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                    Sign Up & Claim Bonus →
                </div>
            </div>
        </div>
    );
}

// ── Crypto Event Preview ──
function CryptoEventPreview({ form }: { form: Omit<CryptoEvent, 'id'> }) {
    if (!form.tokenSymbol) return null;
    const statusColors: Record<string, { bg: string; text: string }> = {
        live: { bg: 'rgba(239,68,68,0.15)', text: '#fca5a5' },
        upcoming: { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d' },
        ended: { bg: 'rgba(255,255,255,0.06)', text: 'var(--text-muted)' },
    };
    const sc = statusColors[form.status] || statusColors.upcoming;
    const statusLabel = form.status === 'live' ? '🔴 LIVE' : form.status === 'upcoming' ? '⏳ UPCOMING' : '✅ ENDED';
    return (
        <div style={{ marginTop: '16px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', marginBottom: '12px' }}>📱 Live Preview</div>
            <div style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    {isValidUrl(form.platformIcon) ? (
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#111' }}>
                            <Image src={form.platformIcon} alt={form.platform} fill style={{ objectFit: 'cover' }} unoptimized />
                        </div>
                    ) : (
                        <span style={{ fontSize: '1.2rem' }}>{form.platformIcon || '🟡'}</span>
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{form.platform} {form.eventType}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: sc.bg, color: sc.text, marginLeft: 'auto' }}>{statusLabel}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>${form.tokenSymbol}</div>
                {form.tokenName && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{form.tokenName}</div>}
                {form.apr && <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700 }}>Est. APR: {form.apr}</div>}
                {form.totalRewards && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Rewards: {form.totalRewards}</div>}
            </div>
        </div>
    );
}

// ── Main Component ──
export default function AdminSpecialOffer({ addToast }: Props) {
    const [subTab, setSubTab] = useState<'exchanges' | 'events'>('exchanges');

    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [exForm, setExForm] = useState<Omit<Exchange, 'id'>>(defaultExchange);
    const [exEditId, setExEditId] = useState<number | null>(null);
    const [exFeatures, setExFeatures] = useState('');
    const [exLoading, setExLoading] = useState(false);

    const [cryptoEvents, setCryptoEvents] = useState<CryptoEvent[]>([]);
    const [ceForm, setCeForm] = useState<Omit<CryptoEvent, 'id'>>(defaultEvent);
    const [ceEditId, setCeEditId] = useState<number | null>(null);
    const [ceStaking, setCeStaking] = useState('');
    const [ceTags, setCeTags] = useState('');
    const [ceLoading, setCeLoading] = useState(false);

    const fetchExchanges = useCallback(async () => {
        try { const res = await fetch('/api/exchanges?all=true'); const data = await res.json(); setExchanges(Array.isArray(data) ? data : []); }
        catch { addToast('Failed to fetch exchanges.', 'error'); }
    }, [addToast]);

    const fetchCryptoEvents = useCallback(async () => {
        try { const res = await fetch('/api/crypto-events?all=true'); const data = await res.json(); setCryptoEvents(Array.isArray(data) ? data : []); }
        catch { addToast('Failed to fetch crypto events.', 'error'); }
    }, [addToast]);

    useEffect(() => { fetchExchanges(); fetchCryptoEvents(); }, [fetchExchanges, fetchCryptoEvents]);

    // Exchange handlers
    const resetExForm = () => { setExEditId(null); setExForm(defaultExchange); setExFeatures(''); };
    const startEditEx = (ex: Exchange) => {
        setExEditId(ex.id!); setExForm(ex);
        try { setExFeatures(JSON.parse(ex.features).join(', ')); } catch { setExFeatures(ex.features); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitExchange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!exForm.name.trim()) { addToast('Exchange name is required.', 'error'); return; }
        setExLoading(true);
        const featuresArr = exFeatures.split(',').map(s => s.trim()).filter(Boolean);
        const body = { ...exForm, features: JSON.stringify(featuresArr), ...(exEditId ? { id: exEditId } : {}) };
        try {
            const res = await fetch('/api/exchanges', { method: exEditId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (res.ok) { addToast(exEditId ? 'Exchange updated.' : 'Exchange added.'); resetExForm(); fetchExchanges(); }
            else { addToast('Failed to save exchange.', 'error'); }
        } catch { addToast('Network error.', 'error'); }
        finally { setExLoading(false); }
    };

    const deleteEx = async (id: number) => { try { const res = await fetch(`/api/exchanges?id=${id}`, { method: 'DELETE' }); if (res.ok) { addToast('Exchange removed.'); fetchExchanges(); } } catch { addToast('Delete failed.', 'error'); } };
    const toggleExVis = async (ex: Exchange) => { try { await fetch('/api/exchanges', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ex.id, isVisible: !ex.isVisible }) }); addToast(ex.isVisible ? 'Hidden.' : 'Visible.'); fetchExchanges(); } catch { addToast('Failed.', 'error'); } };

    // Crypto Event handlers
    const resetCeForm = () => { setCeEditId(null); setCeForm(defaultEvent); setCeStaking(''); setCeTags(''); };
    const startEditCe = (ev: CryptoEvent) => {
        setCeEditId(ev.id!); setCeForm(ev);
        try { setCeStaking(JSON.parse(ev.stakingAssets).join(', ')); } catch { setCeStaking(ev.stakingAssets); }
        try { setCeTags(JSON.parse(ev.tags).join(', ')); } catch { setCeTags(ev.tags); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitCryptoEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ceForm.tokenSymbol.trim()) { addToast('Token symbol is required.', 'error'); return; }
        setCeLoading(true);
        const stakingArr = ceStaking.split(',').map(s => s.trim()).filter(Boolean);
        const tagsArr = ceTags.split(',').map(s => s.trim()).filter(Boolean);
        const body = { ...ceForm, stakingAssets: JSON.stringify(stakingArr), tags: JSON.stringify(tagsArr), ...(ceEditId ? { id: ceEditId } : {}) };
        try {
            const res = await fetch('/api/crypto-events', { method: ceEditId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (res.ok) { addToast(ceEditId ? 'Updated.' : 'Added.'); resetCeForm(); fetchCryptoEvents(); }
            else { addToast('Failed to save.', 'error'); }
        } catch { addToast('Network error.', 'error'); }
        finally { setCeLoading(false); }
    };

    const deleteCe = async (id: number) => { try { const res = await fetch(`/api/crypto-events?id=${id}`, { method: 'DELETE' }); if (res.ok) { addToast('Removed.'); fetchCryptoEvents(); } } catch { addToast('Failed.', 'error'); } };
    const toggleCeVis = async (ev: CryptoEvent) => { try { await fetch('/api/crypto-events', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ev.id, isVisible: !ev.isVisible }) }); addToast(ev.isVisible ? 'Hidden.' : 'Visible.'); fetchCryptoEvents(); } catch { addToast('Failed.', 'error'); } };

    return (
        <div className="admin-page-layout trans-enter">
            {/* Sub-tabs */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px', width: 'fit-content' }}>
                <button onClick={() => setSubTab('exchanges')} className={`admin-tab ${subTab === 'exchanges' ? 'active' : ''}`}>🏆 Exchanges</button>
                <button onClick={() => setSubTab('events')} className={`admin-tab ${subTab === 'events' ? 'active' : ''}`}>📡 Crypto Events</button>
            </div>

            {subTab === 'exchanges' && (
                <>
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <div className="admin-card-icon">🏆</div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{exEditId ? 'Edit Exchange' : 'Add Exchange'}</h2>
                                {exEditId && <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Editing</span>}
                            </div>
                        </div>
                        <form onSubmit={submitExchange} className="admin-form">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Exchange Name *</label>
                                    <input className="form-input" value={exForm.name} onChange={e => setExForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Binance" />
                                </div>

                                <ImageUploadField label="Logo Image" value={exForm.logo} onChange={v => setExForm(p => ({ ...p, logo: v }))} addToast={addToast} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Badge Text</label>
                                        <input className="form-input" value={exForm.badge} onChange={e => setExForm(p => ({ ...p, badge: e.target.value }))} placeholder="Best for P2P" />
                                    </div>
                                    <div className="form-group">
                                        <label>Badge Color</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input type="color" value={exForm.badgeColor} onChange={e => setExForm(p => ({ ...p, badgeColor: e.target.value }))} style={{ width: '40px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                                            <input className="form-input" value={exForm.badgeColor} onChange={e => setExForm(p => ({ ...p, badgeColor: e.target.value }))} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Bonus Text</label>
                                    <input className="form-input" value={exForm.bonus} onChange={e => setExForm(p => ({ ...p, bonus: e.target.value }))} placeholder="Up to $600 Bonus" />
                                </div>

                                <GradientPicker value={exForm.gradient} onChange={v => setExForm(p => ({ ...p, gradient: v }))} />
                                <GlowPicker value={exForm.glowColor} onChange={v => setExForm(p => ({ ...p, glowColor: v }))} />

                                <div className="form-group">
                                    <label>Features (comma-separated)</label>
                                    <input className="form-input" value={exFeatures} onChange={e => setExFeatures(e.target.value)} placeholder="Lowest spot fees, 350+ cryptos, #1 by volume" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Affiliate Link</label>
                                        <input className="form-input" type="text" value={exForm.link} onChange={e => setExForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." />
                                    </div>
                                    <div className="form-group">
                                        <label>Sort Order</label>
                                        <input className="form-input" type="number" value={exForm.sortOrder} onChange={e => setExForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <ExchangePreview form={exForm} features={exFeatures} />

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className="submit-btn" disabled={exLoading} style={{ flex: 1 }}>
                                        {exLoading ? '⏳ Saving...' : exEditId ? '✓ Update Exchange' : '🚀 Add Exchange'}
                                    </button>
                                    {exEditId && <button type="button" onClick={resetExForm} className="edit-btn">Cancel</button>}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="manage-container">
                        <div className="manage-header">
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Exchanges</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>{exchanges.length} configured</p>
                            </div>
                            <button onClick={() => { fetchExchanges(); addToast('Synced.'); }} className="edit-btn" style={{ fontSize: '0.75rem' }}>↻ Sync</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            {exchanges.length === 0 ? (
                                <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏦</div>
                                    <p>No exchanges configured yet.</p>
                                </div>
                            ) : exchanges.map(ex => (
                                <div key={ex.id} className="post-item-admin" style={{ opacity: ex.isVisible ? 1 : 0.5 }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                        {isValidUrl(ex.logo) ? (
                                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#111' }}>
                                                <Image src={ex.logo} alt={ex.name} fill style={{ objectFit: 'cover' }} unoptimized />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '1.5rem' }}>{ex.logo || '🟡'}</span>
                                        )}
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>{ex.name}</p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>{ex.badge} · {ex.bonus}</p>
                                        </div>
                                    </div>
                                    <div className="post-item-actions">
                                        <button onClick={() => toggleExVis(ex)} className="edit-btn" style={{ fontSize: '0.7rem' }}>{ex.isVisible ? '👁' : '🚫'}</button>
                                        <button onClick={() => startEditEx(ex)} className="edit-btn">Edit</button>
                                        <button onClick={() => deleteEx(ex.id!)} className="delete-btn">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {subTab === 'events' && (
                <>
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <div className="admin-card-icon">📡</div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{ceEditId ? 'Edit Crypto Event' : 'Add Crypto Event'}</h2>
                                {ceEditId && <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Editing</span>}
                            </div>
                        </div>
                        <form onSubmit={submitCryptoEvent} className="admin-form">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Platform</label>
                                        <input className="form-input" value={ceForm.platform} onChange={e => setCeForm(p => ({ ...p, platform: e.target.value }))} placeholder="Binance" />
                                    </div>
                                    <div className="form-group">
                                        <label>Platform Color</label>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <input type="color" value={ceForm.platformColor} onChange={e => setCeForm(p => ({ ...p, platformColor: e.target.value }))} style={{ width: '32px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input className="form-input" value={ceForm.platformColor} onChange={e => setCeForm(p => ({ ...p, platformColor: e.target.value }))} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                </div>

                                <ImageUploadField label="Platform Icon Image" value={ceForm.platformIcon} onChange={v => setCeForm(p => ({ ...p, platformIcon: v }))} addToast={addToast} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Event Type</label>
                                        <select className="form-input" value={ceForm.eventType} onChange={e => setCeForm(p => ({ ...p, eventType: e.target.value }))}>
                                            <option value="Launchpool">Launchpool</option>
                                            <option value="Megadrop">Megadrop</option>
                                            <option value="Airdrop">Airdrop</option>
                                            <option value="IDO">IDO</option>
                                            <option value="IEO">IEO</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select className="form-input" value={ceForm.status} onChange={e => setCeForm(p => ({ ...p, status: e.target.value }))}>
                                            <option value="live">🔴 Live</option>
                                            <option value="upcoming">⏳ Upcoming</option>
                                            <option value="ended">✅ Ended</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Token Symbol *</label>
                                        <input className="form-input" value={ceForm.tokenSymbol} onChange={e => setCeForm(p => ({ ...p, tokenSymbol: e.target.value }))} placeholder="KERNEL" />
                                    </div>
                                    <div className="form-group">
                                        <label>Token Name</label>
                                        <input className="form-input" value={ceForm.tokenName} onChange={e => setCeForm(p => ({ ...p, tokenName: e.target.value }))} placeholder="KernelDAO" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input className="form-input" value={ceForm.description} onChange={e => setCeForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input className="form-input" type="datetime-local" value={ceForm.endDate ? ceForm.endDate.slice(0, 16) : ''} onChange={e => setCeForm(p => ({ ...p, endDate: new Date(e.target.value).toISOString() }))} />
                                    </div>
                                    <div className="form-group">
                                        <label>Total Rewards</label>
                                        <input className="form-input" value={ceForm.totalRewards} onChange={e => setCeForm(p => ({ ...p, totalRewards: e.target.value }))} placeholder="40M KERNEL" />
                                    </div>
                                    <div className="form-group">
                                        <label>Est. APR</label>
                                        <input className="form-input" value={ceForm.apr} onChange={e => setCeForm(p => ({ ...p, apr: e.target.value }))} placeholder="~45%" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Staking Assets (comma-separated)</label>
                                    <input className="form-input" value={ceStaking} onChange={e => setCeStaking(e.target.value)} placeholder="BNB, FDUSD, USDC" />
                                </div>
                                <div className="form-group">
                                    <label>Tags (comma-separated)</label>
                                    <input className="form-input" value={ceTags} onChange={e => setCeTags(e.target.value)} placeholder="Hot, BNB Chain, Restaking" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>CTA Link</label>
                                        <input className="form-input" type="text" value={ceForm.ctaLink} onChange={e => setCeForm(p => ({ ...p, ctaLink: e.target.value }))} placeholder="https://..." />
                                    </div>
                                    <div className="form-group">
                                        <label>Sort Order</label>
                                        <input className="form-input" type="number" value={ceForm.sortOrder} onChange={e => setCeForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <CryptoEventPreview form={ceForm} />

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className="submit-btn" disabled={ceLoading} style={{ flex: 1 }}>
                                        {ceLoading ? '⏳ Saving...' : ceEditId ? '✓ Update Event' : '🚀 Add Event'}
                                    </button>
                                    {ceEditId && <button type="button" onClick={resetCeForm} className="edit-btn">Cancel</button>}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="manage-container">
                        <div className="manage-header">
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Crypto Events</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>{cryptoEvents.length} configured</p>
                            </div>
                            <button onClick={() => { fetchCryptoEvents(); addToast('Synced.'); }} className="edit-btn" style={{ fontSize: '0.75rem' }}>↻ Sync</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            {cryptoEvents.length === 0 ? (
                                <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📡</div>
                                    <p>No crypto events configured yet.</p>
                                </div>
                            ) : cryptoEvents.map(ev => (
                                <div key={ev.id} className="post-item-admin" style={{ opacity: ev.isVisible ? 1 : 0.5 }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                        {isValidUrl(ev.platformIcon) ? (
                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#111' }}>
                                                <Image src={ev.platformIcon} alt={ev.platform} fill style={{ objectFit: 'cover' }} unoptimized />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '1.5rem' }}>{ev.platformIcon || '🟡'}</span>
                                        )}
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                                                ${ev.tokenSymbol}
                                                <span style={{ marginLeft: '8px', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: ev.status === 'live' ? 'rgba(239,68,68,0.15)' : ev.status === 'upcoming' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)', color: ev.status === 'live' ? '#fca5a5' : ev.status === 'upcoming' ? '#fcd34d' : 'var(--text-muted)' }}>{ev.status.toUpperCase()}</span>
                                            </p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                                {ev.platform} · {ev.eventType} {ev.apr ? `· APR: ${ev.apr}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="post-item-actions">
                                        <button onClick={() => toggleCeVis(ev)} className="edit-btn" style={{ fontSize: '0.7rem' }}>{ev.isVisible ? '👁' : '🚫'}</button>
                                        <button onClick={() => startEditCe(ev)} className="edit-btn">Edit</button>
                                        <button onClick={() => deleteCe(ev.id!)} className="delete-btn">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
