'use client';

import { useState, useEffect, useCallback } from 'react';

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

const defaultExchange: Omit<Exchange, 'id'> = {
    name: '', badge: '', badgeColor: '#f0b90b', bonus: '',
    gradient: 'linear-gradient(135deg, #f0b90b 0%, #d4a20a 50%, #b8890a 100%)',
    glowColor: 'rgba(240, 185, 11, 0.3)', logo: '🟡',
    features: '[]', link: '#', sortOrder: 0, isVisible: true,
};

const defaultEvent: Omit<CryptoEvent, 'id'> = {
    platform: 'Binance', platformIcon: '🟡', platformColor: '#f0b90b',
    eventType: 'Launchpool', tokenSymbol: '', tokenName: '', description: '',
    status: 'upcoming', endDate: '', totalRewards: '', stakingAssets: '[]',
    apr: '', tags: '[]', ctaLink: '#', sortOrder: 0, isVisible: true,
};

export default function AdminSpecialOffer({ addToast }: Props) {
    const [subTab, setSubTab] = useState<'exchanges' | 'events'>('exchanges');

    // --- Exchanges ---
    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [exForm, setExForm] = useState<Omit<Exchange, 'id'>>(defaultExchange);
    const [exEditId, setExEditId] = useState<number | null>(null);
    const [exFeatures, setExFeatures] = useState('');
    const [exLoading, setExLoading] = useState(false);

    // --- Crypto Events ---
    const [cryptoEvents, setCryptoEvents] = useState<CryptoEvent[]>([]);
    const [ceForm, setCeForm] = useState<Omit<CryptoEvent, 'id'>>(defaultEvent);
    const [ceEditId, setCeEditId] = useState<number | null>(null);
    const [ceStaking, setCeStaking] = useState('');
    const [ceTags, setCeTags] = useState('');
    const [ceLoading, setCeLoading] = useState(false);

    // Fetch exchanges
    const fetchExchanges = useCallback(async () => {
        try {
            const res = await fetch('/api/exchanges?all=true');
            const data = await res.json();
            setExchanges(Array.isArray(data) ? data : []);
        } catch { addToast('Failed to fetch exchanges.', 'error'); }
    }, [addToast]);

    // Fetch crypto events
    const fetchCryptoEvents = useCallback(async () => {
        try {
            const res = await fetch('/api/crypto-events?all=true');
            const data = await res.json();
            setCryptoEvents(Array.isArray(data) ? data : []);
        } catch { addToast('Failed to fetch crypto events.', 'error'); }
    }, [addToast]);

    useEffect(() => { fetchExchanges(); fetchCryptoEvents(); }, [fetchExchanges, fetchCryptoEvents]);

    // Exchange handlers
    const resetExForm = () => { setExEditId(null); setExForm(defaultExchange); setExFeatures(''); };

    const startEditEx = (ex: Exchange) => {
        setExEditId(ex.id!);
        setExForm(ex);
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
            const res = await fetch('/api/exchanges', {
                method: exEditId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                addToast(exEditId ? 'Exchange updated.' : 'Exchange added.');
                resetExForm();
                fetchExchanges();
            } else { addToast('Failed to save exchange.', 'error'); }
        } catch { addToast('Network error.', 'error'); }
        finally { setExLoading(false); }
    };

    const deleteExchange = async (id: number) => {
        try {
            const res = await fetch(`/api/exchanges?id=${id}`, { method: 'DELETE' });
            if (res.ok) { addToast('Exchange removed.'); fetchExchanges(); }
        } catch { addToast('Delete failed.', 'error'); }
    };

    const toggleExVisibility = async (ex: Exchange) => {
        try {
            await fetch('/api/exchanges', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ex.id, isVisible: !ex.isVisible }),
            });
            addToast(ex.isVisible ? 'Exchange hidden.' : 'Exchange visible.');
            fetchExchanges();
        } catch { addToast('Update failed.', 'error'); }
    };

    // Crypto Event handlers
    const resetCeForm = () => { setCeEditId(null); setCeForm(defaultEvent); setCeStaking(''); setCeTags(''); };

    const startEditCe = (ev: CryptoEvent) => {
        setCeEditId(ev.id!);
        setCeForm(ev);
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
            const res = await fetch('/api/crypto-events', {
                method: ceEditId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                addToast(ceEditId ? 'Crypto event updated.' : 'Crypto event added.');
                resetCeForm();
                fetchCryptoEvents();
            } else { addToast('Failed to save event.', 'error'); }
        } catch { addToast('Network error.', 'error'); }
        finally { setCeLoading(false); }
    };

    const deleteCryptoEvent = async (id: number) => {
        try {
            const res = await fetch(`/api/crypto-events?id=${id}`, { method: 'DELETE' });
            if (res.ok) { addToast('Crypto event removed.'); fetchCryptoEvents(); }
        } catch { addToast('Delete failed.', 'error'); }
    };

    const toggleCeVisibility = async (ev: CryptoEvent) => {
        try {
            await fetch('/api/crypto-events', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ev.id, isVisible: !ev.isVisible }),
            });
            addToast(ev.isVisible ? 'Event hidden.' : 'Event visible.');
            fetchCryptoEvents();
        } catch { addToast('Update failed.', 'error'); }
    };

    return (
        <div className="admin-page-layout trans-enter">
            {/* Sub-tabs */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px', width: 'fit-content' }}>
                <button
                    onClick={() => setSubTab('exchanges')}
                    className={`admin-tab ${subTab === 'exchanges' ? 'active' : ''}`}
                >🏆 Exchanges</button>
                <button
                    onClick={() => setSubTab('events')}
                    className={`admin-tab ${subTab === 'events' ? 'active' : ''}`}
                >📡 Crypto Events</button>
            </div>

            {subTab === 'exchanges' && (
                <>
                    {/* Exchange Form */}
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Exchange Name *</label>
                                        <input className="form-input" value={exForm.name} onChange={e => setExForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Binance" />
                                    </div>
                                    <div className="form-group">
                                        <label>Logo Emoji</label>
                                        <input className="form-input" value={exForm.logo} onChange={e => setExForm(p => ({ ...p, logo: e.target.value }))} placeholder="🟡" />
                                    </div>
                                </div>
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
                                <div className="form-group">
                                    <label>CTA Gradient</label>
                                    <input className="form-input" value={exForm.gradient} onChange={e => setExForm(p => ({ ...p, gradient: e.target.value }))} placeholder="linear-gradient(135deg, #f0b90b 0%, ...)" />
                                </div>
                                <div className="form-group">
                                    <label>Glow Color (rgba)</label>
                                    <input className="form-input" value={exForm.glowColor} onChange={e => setExForm(p => ({ ...p, glowColor: e.target.value }))} placeholder="rgba(240, 185, 11, 0.3)" />
                                </div>
                                <div className="form-group">
                                    <label>Features (comma-separated)</label>
                                    <input className="form-input" value={exFeatures} onChange={e => setExFeatures(e.target.value)} placeholder="Lowest spot fees, 350+ cryptos, #1 by volume" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Affiliate Link</label>
                                        <input className="form-input" type="url" value={exForm.link} onChange={e => setExForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." />
                                    </div>
                                    <div className="form-group">
                                        <label>Sort Order</label>
                                        <input className="form-input" type="number" value={exForm.sortOrder} onChange={e => setExForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className="submit-btn" disabled={exLoading} style={{ flex: 1 }}>
                                        {exLoading ? '⏳ Saving...' : exEditId ? '✓ Update Exchange' : '🚀 Add Exchange'}
                                    </button>
                                    {exEditId && <button type="button" onClick={resetExForm} className="edit-btn">Cancel</button>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Exchange List */}
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
                                        <span style={{ fontSize: '1.5rem' }}>{ex.logo}</span>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>{ex.name}</p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>{ex.badge} · {ex.bonus}</p>
                                        </div>
                                    </div>
                                    <div className="post-item-actions">
                                        <button onClick={() => toggleExVisibility(ex)} className="edit-btn" style={{ fontSize: '0.7rem' }}>{ex.isVisible ? '👁' : '🚫'}</button>
                                        <button onClick={() => startEditEx(ex)} className="edit-btn">Edit</button>
                                        <button onClick={() => deleteExchange(ex.id!)} className="delete-btn">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {subTab === 'events' && (
                <>
                    {/* Crypto Event Form */}
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Platform</label>
                                        <input className="form-input" value={ceForm.platform} onChange={e => setCeForm(p => ({ ...p, platform: e.target.value }))} placeholder="Binance" />
                                    </div>
                                    <div className="form-group">
                                        <label>Platform Icon</label>
                                        <input className="form-input" value={ceForm.platformIcon} onChange={e => setCeForm(p => ({ ...p, platformIcon: e.target.value }))} placeholder="🟡" />
                                    </div>
                                    <div className="form-group">
                                        <label>Platform Color</label>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <input type="color" value={ceForm.platformColor} onChange={e => setCeForm(p => ({ ...p, platformColor: e.target.value }))} style={{ width: '32px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                                            <input className="form-input" value={ceForm.platformColor} onChange={e => setCeForm(p => ({ ...p, platformColor: e.target.value }))} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                </div>
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
                                        <label>End Date (ISO)</label>
                                        <input className="form-input" type="datetime-local" value={ceForm.endDate ? ceForm.endDate.slice(0, 16) : ''} onChange={e => setCeForm(p => ({ ...p, endDate: new Date(e.target.value).toISOString() }))} />
                                    </div>
                                    <div className="form-group">
                                        <label>Total Rewards</label>
                                        <input className="form-input" value={ceForm.totalRewards} onChange={e => setCeForm(p => ({ ...p, totalRewards: e.target.value }))} placeholder="40,000,000 KERNEL" />
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
                                        <input className="form-input" type="url" value={ceForm.ctaLink} onChange={e => setCeForm(p => ({ ...p, ctaLink: e.target.value }))} placeholder="https://..." />
                                    </div>
                                    <div className="form-group">
                                        <label>Sort Order</label>
                                        <input className="form-input" type="number" value={ceForm.sortOrder} onChange={e => setCeForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className="submit-btn" disabled={ceLoading} style={{ flex: 1 }}>
                                        {ceLoading ? '⏳ Saving...' : ceEditId ? '✓ Update Event' : '🚀 Add Event'}
                                    </button>
                                    {ceEditId && <button type="button" onClick={resetCeForm} className="edit-btn">Cancel</button>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Crypto Events List */}
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
                                        <span style={{ fontSize: '1.5rem' }}>{ev.platformIcon}</span>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                                                ${ev.tokenSymbol}
                                                <span style={{
                                                    marginLeft: '8px', fontSize: '0.6rem', fontWeight: 800,
                                                    padding: '2px 8px', borderRadius: '999px',
                                                    background: ev.status === 'live' ? 'rgba(239,68,68,0.15)' : ev.status === 'upcoming' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                                                    color: ev.status === 'live' ? '#fca5a5' : ev.status === 'upcoming' ? '#fcd34d' : 'var(--text-muted)',
                                                }}>{ev.status.toUpperCase()}</span>
                                            </p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                                {ev.platform} · {ev.eventType} {ev.apr ? `· APR: ${ev.apr}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="post-item-actions">
                                        <button onClick={() => toggleCeVisibility(ev)} className="edit-btn" style={{ fontSize: '0.7rem' }}>{ev.isVisible ? '👁' : '🚫'}</button>
                                        <button onClick={() => startEditCe(ev)} className="edit-btn">Edit</button>
                                        <button onClick={() => deleteCryptoEvent(ev.id!)} className="delete-btn">Remove</button>
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
