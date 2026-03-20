import { getAllPosts } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import SearchBar from '@/components/SearchBar';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { Pin, Newspaper, Edit3, MessageCircle, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return buildMetadata({
        title: "Deep Dive Zone",
        description: "The complete curated feed of news, blog posts, and X threads by DaveyNFTs — all picks, sorted by date.",
        canonicalPath: '/picks',
        type: 'website',
        keywords: ['crypto picks', 'web3 curation', 'DaveyNFTs', 'news feed', 'X threads', 'blockchain blog'],
        allowIndexing: true,
    });
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop';

function isValidImageUrl(url?: string): boolean {
    if (!url || !url.startsWith('http')) return false;
    const nonImagePatterns = [
        /^https?:\/\/(www\.)?x\.com\/[^/]+\/(photo|status)/,
        /^https?:\/\/(www\.)?twitter\.com\/[^/]+\/(photo|status)/,
    ];
    if (nonImagePatterns.some(p => p.test(url))) return false;
    return true;
}

type FilterType = 'all' | 'news' | 'blog' | 'x';

interface PageProps {
    searchParams: Promise<{ filter?: string }>;
}

export default async function PicksPage({ searchParams }: PageProps) {
    noStore();
    const { filter } = await searchParams;

    const allPosts = await getAllPosts();

    const visiblePosts = allPosts.filter(p => !p.isMore);
    const morePosts = allPosts.filter(p => p.isMore);

    const activeFilter = (filter && ['news', 'blog', 'x'].includes(filter.toLowerCase()))
        ? filter.toLowerCase() as FilterType
        : 'all';

    const filteredPosts = activeFilter === 'all'
        ? visiblePosts
        : visiblePosts.filter(p => p.type.toLowerCase() === activeFilter);

    const typeColor = (type: string) =>
        type === 'X' ? 'var(--x-color)' : type === 'News' ? 'var(--news-color)' : 'var(--blog-color)';

    const typeTextColor = (type: string) => type === 'X' ? '#fff' : '#000';

    const categories: { label: React.ReactNode; value: FilterType }[] = [
        { label: 'All', value: 'all' },
        { label: <><Newspaper className="inline-block mr-1.5" size={14} /> News</>, value: 'news' },
        { label: <><Edit3 className="inline-block mr-1.5" size={14} /> Blog</>, value: 'blog' },
        { label: <><MessageCircle className="inline-block mr-1.5" size={14} /> X Thread</>, value: 'x' },
    ];

    return (
        <div className="archive-page-container">
            {/* Hero */}
            <div className="archive-hero">
                <div className="liquid-blob blob-1" style={{ opacity: 0.2, top: '-10%', left: '-5%', background: 'var(--x-color)' }} />
                <div className="liquid-blob blob-3" style={{ opacity: 0.15, top: '30%', right: '10%' }} />
                <Container>
                    <div className="archive-hero-content">
                        <Link href="/" className="more-back-btn">← Back to Home</Link>
                        <div style={{ marginTop: '24px' }}>
                            <span className="more-label"><Pin className="inline-block mr-1" size={16} /> Full Feed</span>
                            <h1 className="archive-hero-title">Deep Dive Zone</h1>
                            <p className="archive-hero-subtitle">
                                Every curated news, blog post, and X thread — the complete collection.
                            </p>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <SearchBar scope="posts" placeholder="Search picks..." compact />
                        </div>
                        <div className="archive-hero-stats">
                            <div className="archive-stat">
                                <span className="archive-stat-num">{visiblePosts.length}</span>
                                <span className="archive-stat-label">Active Picks</span>
                            </div>
                            {['News', 'Blog', 'X'].map(type => {
                                const count = visiblePosts.filter(p => p.type === type).length;
                                return count > 0 ? (
                                    <div key={type} style={{ display: 'contents' }}>
                                        <div className="archive-stat-sep" />
                                        <div className="archive-stat">
                                            <span className="archive-stat-num">{count}</span>
                                            <span className="archive-stat-label">{type === 'X' ? '𝕏 Thread' : type}</span>
                                        </div>
                                    </div>
                                ) : null;
                            })}
                            {morePosts.length > 0 && (
                                <>
                                    <div className="archive-stat-sep" />
                                    <div className="archive-stat">
                                        <span className="archive-stat-num">{morePosts.length}</span>
                                        <span className="archive-stat-label">Archived</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Container>
            </div>

            <Container style={{ paddingTop: '48px', paddingBottom: '120px' }}>
                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <Link
                            key={cat.value}
                            href={cat.value === 'all' ? '/picks' : `/picks?filter=${cat.value}`}
                            className={`picks-filter-tab ${activeFilter === cat.value ? 'active' : ''}`}
                        >
                            {cat.label}
                        </Link>
                    ))}
                </div>

                {allPosts.length === 0 ? (
                    <div className="more-empty-state">
                        <div className="more-empty-icon"><Pin size={48} className="opacity-50" /></div>
                        <h2>No picks yet</h2>
                        <p>Posts added through the admin panel will appear here.</p>
                        <Link href="/admin" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '24px' }}>Go to Admin</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
                        {/* Main Feed */}
                        <section>
                            <div className="archive-section-header">
                                <h2 className="archive-section-title">
                                    <span className="archive-section-dot" style={{ background: 'var(--accent-color)' }} />
                                    {activeFilter === 'all' ? 'All Picks' :
                                        activeFilter === 'x' ? '𝕏 Thread Picks' :
                                            `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Picks`}
                                </h2>
                                <span className="more-month-count">{filteredPosts.length}</span>
                            </div>

                            {filteredPosts.length === 0 ? (
                                <div className="more-empty-state" style={{ padding: '80px 40px' }}>
                                    <div className="more-empty-icon"><Search size={48} className="opacity-50" /></div>
                                    <h2 style={{ fontSize: '1.5rem' }}>No {activeFilter} posts</h2>
                                    <p>Try a different filter or add posts from the admin panel.</p>
                                </div>
                            ) : (
                                <div className="picks-grid">
                                    {filteredPosts.map(post => {
                                        const hasValidImg = isValidImageUrl(post.imageUrl);
                                        const imgSrc = hasValidImg ? post.imageUrl! : FALLBACK_IMAGE;
                                        return (
                                            <a
                                                key={post.id}
                                                href={post.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="picks-card"
                                            >
                                                <div className="picks-card-image">
                                                    <Image src={imgSrc} alt={post.title} fill style={{ objectFit: 'cover' }} unoptimized />
                                                    <div className="picks-card-overlay" />
                                                    <span
                                                        className="picks-card-type"
                                                        style={{ background: typeColor(post.type), color: typeTextColor(post.type) }}
                                                    >
                                                        {post.type}
                                                    </span>
                                                </div>
                                                <div className="picks-card-body">
                                                    <h3 className="picks-card-title">{post.title}</h3>
                                                    <div className="picks-card-footer">
                                                        <span className="picks-card-date">
                                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                        </span>
                                                        <span className="picks-card-link">ACCESS SOURCE →</span>
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Archived / More */}
                        {morePosts.length > 0 && (
                            <section>
                                <div className="archive-section-header">
                                    <h2 className="archive-section-title">
                                        <span className="archive-section-dot" style={{ background: 'var(--text-muted)' }} />
                                        Extended Archive
                                    </h2>
                                    <span className="more-month-count">{morePosts.length}</span>
                                </div>
                                <div className="picks-grid">
                                    {morePosts.map(post => {
                                        const hasValidImg = isValidImageUrl(post.imageUrl);
                                        const imgSrc = hasValidImg ? post.imageUrl! : FALLBACK_IMAGE;
                                        return (
                                            <a
                                                key={post.id}
                                                href={post.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="picks-card"
                                                style={{ opacity: 0.7 }}
                                            >
                                                <div className="picks-card-image">
                                                    <Image src={imgSrc} alt={post.title} fill style={{ objectFit: 'cover' }} unoptimized />
                                                    <div className="picks-card-overlay" />
                                                    <span className="picks-card-type" style={{ background: typeColor(post.type), color: typeTextColor(post.type) }}>
                                                        {post.type}
                                                    </span>
                                                </div>
                                                <div className="picks-card-body">
                                                    <h3 className="picks-card-title">{post.title}</h3>
                                                    <div className="picks-card-footer">
                                                        <span className="picks-card-date">
                                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                        </span>
                                                        <span className="picks-card-link">ACCESS SOURCE →</span>
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}
