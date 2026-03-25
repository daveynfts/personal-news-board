import { getAllPosts } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import PostCard from '@/components/PostCard';
import SearchBar from '@/components/SearchBar';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { Pin, Newspaper, Edit3, MessageCircle, Search } from 'lucide-react';
import { Tr } from '@/components/TranslatableText';

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

type FilterType = 'all' | 'research' | 'article';

interface PageProps {
    searchParams: Promise<{ filter?: string }>;
}

export default async function PicksPage({ searchParams }: PageProps) {
    noStore();
    const { filter } = await searchParams;

    const allPosts = await getAllPosts();

    const visiblePosts = allPosts.filter(p => !p.isMore);
    const morePosts = allPosts.filter(p => p.isMore);

    const activeFilter = (filter && ['research', 'article'].includes(filter.toLowerCase()))
        ? filter.toLowerCase() as FilterType
        : 'all';

    const filteredPosts = activeFilter === 'all'
        ? visiblePosts
        : visiblePosts.filter(p => p.type.toLowerCase() === activeFilter);

    const typeColor = (type: string) =>
        type.toLowerCase() === 'research' ? 'var(--news-color)' : 'var(--blog-color)';

    const typeTextColor = (type: string) => '#000';

    const categories: { label: React.ReactNode; value: FilterType }[] = [
        { label: 'All', value: 'all' },
        { label: <><Newspaper className="inline-block mr-1.5" size={14} /> Research</>, value: 'research' },
        { label: <><Edit3 className="inline-block mr-1.5" size={14} /> Article</>, value: 'article' },
    ];

    return (
        <div className="archive-page-container">
            {/* Hero */}
            <div className="archive-hero">
                <div className="liquid-blob blob-1" style={{ opacity: 0.2, top: '-10%', left: '-5%', background: 'var(--x-color)' }} />
                <div className="liquid-blob blob-3" style={{ opacity: 0.15, top: '30%', right: '10%' }} />
                <Container>
                    <div className="archive-hero-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                            <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                                &larr; <Tr i18nKey="btn.backToHome" />
                            </Link>
                            <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: '100%', maxWidth: '400px' }}>
                                    <SearchBar scope="posts" placeholder="Search picks..." compact />
                                </div>
                            </div>
                            <div style={{ width: '100px', display: 'flex', position: 'relative' }} className="hidden-mobile"></div>
                        </div>
                        <div>
                            <span className="more-label"><Pin className="inline-block mr-1" size={16} /> <Tr i18nKey="archive.picksLabel" /></span>
                            <h1 className="archive-hero-title"><Tr i18nKey="archive.picksTitle" /></h1>
                            <p className="archive-hero-subtitle">
                                <Tr i18nKey="archive.picksSubtitle" />
                            </p>
                        </div>
                        
                        <div className="archive-hero-stats">
                            <div className="archive-stat">
                                <span className="archive-stat-num">{visiblePosts.length}</span>
                                <span className="archive-stat-label"><Tr i18nKey="archive.activePicksStat" /></span>
                            </div>
                            {['Research', 'Article'].map(type => {
                                const count = visiblePosts.filter(p => p.type.toLowerCase() === type.toLowerCase()).length;
                                return count > 0 ? (
                                    <div key={type} style={{ display: 'contents' }}>
                                        <div className="archive-stat-sep" />
                                        <div className="archive-stat">
                                            <span className="archive-stat-num">{count}</span>
                                            <span className="archive-stat-label"><Tr i18nKey={`filter.${type.toLowerCase()}`} /></span>
                                        </div>
                                    </div>
                                ) : null;
                            })}
                            {morePosts.length > 0 && (
                                <>
                                    <div className="archive-stat-sep" />
                                    <div className="archive-stat">
                                        <span className="archive-stat-num">{morePosts.length}</span>
                                        <span className="archive-stat-label"><Tr i18nKey="archive.archived" /></span>
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
                                    {activeFilter === 'all' ? <Tr i18nKey="archive.allPicks" /> :
                                            <Tr i18nKey={`filter.${activeFilter}`} />}
                                </h2>
                                <span className="more-month-count">{filteredPosts.length}</span>
                            </div>

                            {filteredPosts.length === 0 ? (
                                <div className="more-empty-state" style={{ padding: '80px 40px' }}>
                                    <div className="more-empty-icon"><Search size={48} className="opacity-50" /></div>
                                    <h2 style={{ fontSize: '1.5rem' }}><Tr i18nKey="archive.noPosts" vars={{ filter: activeFilter }} /></h2>
                                    <p><Tr i18nKey="archive.tryFilter" /></p>
                                </div>
                            ) : (
                                <div className="picks-grid">
                                    {filteredPosts.map(post => (
                                        <PostCard key={post.id} post={post} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Archived / More */}
                        {morePosts.length > 0 && (
                            <section>
                                <div className="archive-section-header">
                                    <h2 className="archive-section-title">
                                        <span className="archive-section-dot" style={{ background: 'var(--text-muted)' }} />
                                        <Tr i18nKey="archive.extendedArchive" />
                                    </h2>
                                    <span className="more-month-count">{morePosts.length}</span>
                                </div>
                                <div className="picks-grid">
                                    {morePosts.map(post => (
                                        <div key={post.id} style={{ opacity: 0.7 }}><PostCard post={post} /></div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}
