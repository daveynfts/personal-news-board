'use client';

import { useState, useEffect, useCallback } from 'react';

interface AnalyticsData {
    overview: {
        totalContent: number;
        totalPosts: number;
        totalArticles: number;
        editorialPicks: number;
        totalEvents: number;
        totalExchanges: number;
        visibleExchanges: number;
        totalCryptoEvents: number;
        liveCryptoEvents: number;
        upcomingCryptoEvents: number;
        totalTweets: number;
        visibleTweets: number;
    };
    postsByType: { type: string; count: number }[];
    monthlyActivity: {
        posts: { month: string; count: number }[];
        articles: { month: string; count: number }[];
    };
    recentActivity: {
        id: number;
        title: string;
        category: 'post' | 'article' | 'event';
        label: string;
        date: string;
    }[];
}

interface Props {
    addToast: (message: string, type?: 'success' | 'error') => void;
}

/* ── tiny SVG sparkline ── */
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
    if (!data.length) return null;
    const max = Math.max(...data, 1);
    const w = 120;
    const points = data.map((v, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * w;
        const y = height - (v / max) * (height - 4);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* area fill */}
            <polygon
                points={`0,${height} ${points} ${w},${height}`}
                fill={`url(#grad-${color.replace('#', '')})`}
            />
        </svg>
    );
}

/* ── simple donut chart ── */
function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (!total) return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet</div>;

    const size = 140;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulated = 0;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                {data.map((d, i) => {
                    const pct = d.value / total;
                    const dashArray = `${circumference * pct} ${circumference * (1 - pct)}`;
                    const offset = -circumference * accumulated;
                    accumulated += pct;
                    return (
                        <circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={colors[i % colors.length]}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dashArray}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
                        />
                    );
                })}
                <text
                    x={size / 2}
                    y={size / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--text-primary)"
                    fontSize="1.6rem"
                    fontWeight="900"
                    style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
                >
                    {total}
                </text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '3px',
                            background: colors[i % colors.length], flexShrink: 0
                        }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── bar chart ── */
function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px', padding: '0 4px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
                    <div style={{
                        width: '100%',
                        maxWidth: '32px',
                        height: `${Math.max((d.value / max) * 70, 3)}px`,
                        borderRadius: '4px 4px 2px 2px',
                        background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
                        transition: 'height 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                        boxShadow: `0 0 12px ${color}33`,
                    }} />
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {d.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ─────── MAIN COMPONENT ─────── */
export default function DashboardAnalytics({ addToast }: Props) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/analytics');
            if (!res.ok) throw new Error('Failed');
            const json = await res.json();
            setData(json);
        } catch {
            addToast('Failed to load analytics data', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="analytics-loading-pulse" />
                <p>Đang tải dữ liệu thống kê...</p>
            </div>
        );
    }

    if (!data) return null;

    const { overview } = data;

    const statCards = [
        { icon: '📊', label: 'Tổng Nội Dung', value: overview.totalContent, color: '#6366f1', sub: 'All content types' },
        { icon: '📌', label: 'Bài Đăng', value: overview.totalPosts, color: '#f59e0b', sub: 'DaveyNFTs Picks' },
        { icon: '✍️', label: 'Bài Viết', value: overview.totalArticles, color: '#10b981', sub: `${overview.editorialPicks} editorial picks` },
        { icon: '📅', label: 'Sự Kiện', value: overview.totalEvents, color: '#3b82f6', sub: 'Timeline events' },
        { icon: '𝕏', label: 'Tweets', value: overview.totalTweets, color: '#1d9bf0', sub: `${overview.visibleTweets} đang hiển thị` },
        { icon: '🎁', label: 'Sàn Giao Dịch', value: overview.totalExchanges, color: '#f43f5e', sub: `${overview.visibleExchanges} đang hiển thị` },
        { icon: '🚀', label: 'Crypto Events', value: overview.totalCryptoEvents, color: '#8b5cf6', sub: `${overview.liveCryptoEvents} live · ${overview.upcomingCryptoEvents} upcoming` },
    ];

    const monthNames: Record<string, string> = {
        '01': 'Th1', '02': 'Th2', '03': 'Th3', '04': 'Th4',
        '05': 'Th5', '06': 'Th6', '07': 'Th7', '08': 'Th8',
        '09': 'Th9', '10': 'Th10', '11': 'Th11', '12': 'Th12',
    };

    const formatMonth = (m: string) => {
        const [, mm] = m.split('-');
        return monthNames[mm] || mm;
    };

    const donutColors = ['#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];

    const postTypeData = data.postsByType.map(pt => ({
        label: pt.type.charAt(0).toUpperCase() + pt.type.slice(1),
        value: pt.count,
    }));

    const categoryIcon: Record<string, string> = { post: '📌', article: '✍️', event: '📅' };
    const categoryColor: Record<string, string> = { post: '#f59e0b', article: '#10b981', event: '#3b82f6' };

    return (
        <div className="analytics-dashboard">
            {/* ── Header ── */}
            <div className="analytics-header">
                <div>
                    <h2 className="analytics-title">📊 Dashboard Analytics</h2>
                    <p className="analytics-subtitle">Thống kê tổng quan về nội dung trên DaveyNFTs News</p>
                </div>
                <button className="analytics-refresh-btn" onClick={() => { setLoading(true); fetchData(); }}>
                    🔄 Làm mới
                </button>
            </div>

            {/* ── Stat Cards Grid ── */}
            <div className="analytics-stats-grid">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className="analytics-stat-card"
                        style={{ '--stat-color': card.color, animationDelay: `${i * 0.06}s` } as React.CSSProperties}
                    >
                        <div className="analytics-stat-icon">{card.icon}</div>
                        <div className="analytics-stat-info">
                            <div className="analytics-stat-value">{card.value.toLocaleString()}</div>
                            <div className="analytics-stat-label">{card.label}</div>
                            <div className="analytics-stat-sub">{card.sub}</div>
                        </div>
                        {/* sparkline for posts & articles */}
                        {card.label === 'Bài Đăng' && data.monthlyActivity.posts.length > 1 && (
                            <div className="analytics-stat-sparkline">
                                <Sparkline data={data.monthlyActivity.posts.map(m => m.count)} color={card.color} />
                            </div>
                        )}
                        {card.label === 'Bài Viết' && data.monthlyActivity.articles.length > 1 && (
                            <div className="analytics-stat-sparkline">
                                <Sparkline data={data.monthlyActivity.articles.map(m => m.count)} color={card.color} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="analytics-charts-row">
                {/* Donut — Post Types */}
                <div className="analytics-chart-card">
                    <h3 className="analytics-chart-title">📂 Phân Loại Bài Đăng</h3>
                    <p className="analytics-chart-desc">Phân bổ theo loại nội dung</p>
                    <div className="analytics-chart-body">
                        <DonutChart data={postTypeData} colors={donutColors} />
                    </div>
                </div>

                {/* Bar chart — Monthly Activity */}
                <div className="analytics-chart-card">
                    <h3 className="analytics-chart-title">📈 Hoạt Động Theo Tháng</h3>
                    <p className="analytics-chart-desc">Bài đăng mới trong 6 tháng gần nhất</p>
                    <div className="analytics-chart-body">
                        {data.monthlyActivity.posts.length > 0 ? (
                            <BarChart
                                data={data.monthlyActivity.posts.map(m => ({ label: formatMonth(m.month), value: m.count }))}
                                color="#6366f1"
                            />
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>
                                Chưa có dữ liệu hoạt động
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Overview Card */}
                <div className="analytics-chart-card">
                    <h3 className="analytics-chart-title">🎯 Tổng Quan Nội Dung</h3>
                    <p className="analytics-chart-desc">Tình trạng hiển thị và phân loại</p>
                    <div className="analytics-chart-body">
                        <div className="analytics-overview-items">
                            <div className="analytics-overview-item">
                                <span className="analytics-overview-dot" style={{ background: '#10b981' }} />
                                <span>Editorial Picks</span>
                                <span className="analytics-overview-count">{overview.editorialPicks}</span>
                            </div>
                            <div className="analytics-overview-item">
                                <span className="analytics-overview-dot" style={{ background: '#1d9bf0' }} />
                                <span>Tweets đang hiển thị</span>
                                <span className="analytics-overview-count">{overview.visibleTweets}/{overview.totalTweets}</span>
                            </div>
                            <div className="analytics-overview-item">
                                <span className="analytics-overview-dot" style={{ background: '#f43f5e' }} />
                                <span>Sàn đang hiển thị</span>
                                <span className="analytics-overview-count">{overview.visibleExchanges}/{overview.totalExchanges}</span>
                            </div>
                            <div className="analytics-overview-item">
                                <span className="analytics-overview-dot" style={{ background: '#8b5cf6' }} />
                                <span>Crypto Events live</span>
                                <span className="analytics-overview-count">{overview.liveCryptoEvents}</span>
                            </div>
                            <div className="analytics-overview-item">
                                <span className="analytics-overview-dot" style={{ background: '#f59e0b' }} />
                                <span>Crypto Events upcoming</span>
                                <span className="analytics-overview-count">{overview.upcomingCryptoEvents}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Recent Activity ── */}
            <div className="analytics-recent-card">
                <h3 className="analytics-chart-title">⚡ Hoạt Động Gần Đây</h3>
                <p className="analytics-chart-desc">10 nội dung mới nhất trên toàn hệ thống</p>
                <div className="analytics-recent-list">
                    {data.recentActivity.map((item, i) => (
                        <div
                            key={`${item.category}-${item.id}`}
                            className="analytics-recent-item"
                            style={{ animationDelay: `${i * 0.04}s` }}
                        >
                            <div className="analytics-recent-icon" style={{ background: `${categoryColor[item.category]}22`, color: categoryColor[item.category] }}>
                                {categoryIcon[item.category]}
                            </div>
                            <div className="analytics-recent-info">
                                <div className="analytics-recent-title">{item.title}</div>
                                <div className="analytics-recent-meta">
                                    <span className="analytics-recent-badge" style={{ background: `${categoryColor[item.category]}18`, color: categoryColor[item.category] }}>
                                        {item.label}
                                    </span>
                                    <span className="analytics-recent-date">
                                        {item.date ? new Date(item.date).toLocaleDateString('vi-VN', {
                                            day: '2-digit', month: '2-digit', year: 'numeric'
                                        }) : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.recentActivity.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px', fontSize: '0.9rem' }}>
                            Chưa có hoạt động nào
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
