import { getMorePosts, getMoreArticles, getMoreEvents } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { Pin, Edit3, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return buildMetadata({
        title: 'More Content',
        description: 'The complete archive of curated posts, articles, and events from DaveyNFTs.',
        canonicalPath: '/more',
        type: 'website',
        keywords: ['crypto news', 'web3', 'blockchain', 'DaveyNFTs', 'archive'],
        allowIndexing: true,
    });
}

type ContentItem = {
    id: string | number;
    type: 'post' | 'article' | 'event';
    title: string;
    subtitle?: string;
    href: string;
    imageUrl?: string;
    tag: string;
    tagColor: string;
    date: string;
    rawDate: Date;
};

export default async function MorePage() {
    noStore();

    const [morePosts, moreArticles, moreEvents] = await Promise.all([
        getMorePosts(),
        getMoreArticles(),
        getMoreEvents(),
    ]);

    const items: ContentItem[] = [
        ...morePosts.map(p => ({
            id: p.id!,
            type: 'post' as const,
            title: p.title,
            href: p.url,
            imageUrl: p.imageUrl,
            tag: p.type,
            tagColor:
                p.type === 'X' ? 'var(--x-color)' :
                p.type === 'News' ? 'var(--news-color)' :
                'var(--blog-color)',
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
            rawDate: p.createdAt ? new Date(p.createdAt) : new Date(0),
        })),
        ...moreArticles.map(a => ({
            id: a.id!,
            type: 'article' as const,
            title: a.title,
            href: `/article/${a.id}`,
            imageUrl: a.coverImage,
            tag: a.isEditorialPick ? '★ Editorial' : 'Article',
            tagColor: 'var(--blog-color)',
            date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
            rawDate: a.createdAt ? new Date(a.createdAt) : new Date(0),
        })),
        ...moreEvents.map(e => ({
            id: e.id!,
            type: 'event' as const,
            title: e.title,
            subtitle: e.location || undefined,
            href: e.link || '#',
            imageUrl: e.imageUrl || e.timelineImageUrl,
            tag: 'Event',
            tagColor: 'var(--accent-color)',
            date: e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
            rawDate: e.createdAt ? new Date(e.createdAt) : new Date(0),
        })),
    ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

    // Group by month-year
    const grouped = items.reduce((acc, item) => {
        const key = item.rawDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, ContentItem[]>);

    const totalCount = items.length;

    return (
        <div className="more-page-container">
            {/* Hero Header */}
            <div className="more-hero">
                <div className="more-hero-bg">
                    <div className="liquid-blob blob-1" style={{ opacity: 0.4, top: '-20%', left: '10%' }} />
                    <div className="liquid-blob blob-2" style={{ opacity: 0.3, bottom: '-10%', right: '5%' }} />
                </div>
                <Container>
                    <div className="more-hero-content">
                        <Link href="/" className="more-back-btn">
                            ← Back
                        </Link>
                        <div className="more-hero-text">
                            <span className="more-label">Extended Archive</span>
                            <h1 className="more-title">All Content</h1>
                            <p className="more-subtitle">
                                The complete collection of curated content — posts, articles, and events —
                                sorted by date.
                            </p>
                        </div>
                        <div className="more-stats">
                            <div className="more-stat-item">
                                <span className="more-stat-number">{totalCount}</span>
                                <span className="more-stat-label">Total Items</span>
                            </div>
                            <div className="more-stat-divider" />
                            <div className="more-stat-item">
                                <span className="more-stat-number">{morePosts.length}</span>
                                <span className="more-stat-label">Posts</span>
                            </div>
                            <div className="more-stat-divider" />
                            <div className="more-stat-item">
                                <span className="more-stat-number">{moreArticles.length}</span>
                                <span className="more-stat-label">Articles</span>
                            </div>
                            <div className="more-stat-divider" />
                            <div className="more-stat-item">
                                <span className="more-stat-number">{moreEvents.length}</span>
                                <span className="more-stat-label">Events</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Content */}
            <Container style={{ paddingTop: '60px', paddingBottom: '120px' }}>
                {totalCount === 0 ? (
                    <div className="more-empty-state">
                        <div className="more-empty-icon">📦</div>
                        <h2>Nothing here yet</h2>
                        <p>
                            Use the <strong>⊕ More</strong> button in the admin panel to move
                            content to this archive page.
                        </p>
                        <Link href="/admin" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '24px' }}>
                            Go to Admin
                        </Link>
                    </div>
                ) : (
                    <div className="more-content-wrapper">
                        {Object.entries(grouped).map(([monthYear, groupItems]) => (
                            <div key={monthYear} className="more-month-group">
                                {/* Month Header */}
                                <div className="more-month-header">
                                    <span className="more-month-label">{monthYear}</span>
                                    <span className="more-month-count">{groupItems.length} items</span>
                                </div>

                                {/* Items Grid */}
                                <div className="more-items-grid">
                                    {groupItems.map(item => (
                                        <Link
                                            key={`${item.type}-${item.id}`}
                                            href={item.href}
                                            target={item.type === 'post' ? '_blank' : undefined}
                                            rel={item.type === 'post' ? 'noopener noreferrer' : undefined}
                                            className="more-card"
                                        >
                                            {/* Image */}
                                            {item.imageUrl && item.imageUrl.startsWith('http') ? (
                                                <div className="more-card-image">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                    <div className="more-card-image-overlay" />
                                                </div>
                                            ) : (
                                                <div className="more-card-image more-card-image-placeholder">
                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, width: '100%', height: '100%' }}>
                                                        {item.type === 'post' ? <Pin size={48} /> : item.type === 'article' ? <Edit3 size={48} /> : <Calendar size={48} />}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Body */}
                                            <div className="more-card-body">
                                                <div className="more-card-meta">
                                                    <span
                                                        className="more-card-tag"
                                                        style={{ background: item.tagColor, color: item.tag === 'X' ? '#fff' : '#000' }}
                                                    >
                                                        {item.tag}
                                                    </span>
                                                    <span className="more-card-date">{item.date}</span>
                                                </div>
                                                <h3 className="more-card-title">{item.title}</h3>
                                                {item.subtitle && (
                                                    <p className="more-card-subtitle">📍 {item.subtitle}</p>
                                                )}
                                            </div>

                                            <div className="more-card-arrow">→</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}
