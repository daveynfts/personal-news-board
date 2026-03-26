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
            <div className="archive-hero relative overflow-hidden">
                <div className="liquid-blob blob-1" style={{ opacity: 0.15, top: '-10%', left: '-5%', background: 'var(--blog-color, var(--accent-color))' }} />
                <div className="liquid-blob blob-3" style={{ opacity: 0.1, bottom: '-20%', right: '10%' }} />
                
                <Container className="relative z-10 pt-6">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-white transition-colors opacity-80 hover:opacity-100">
                        <Tr i18nKey="btn.backToHome" />
                    </Link>

                    <div className="archive-hero-content text-center max-w-3xl mx-auto pt-6 pb-8">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold tracking-widest uppercase text-gray-300 mb-6 drop-shadow-sm backdrop-blur-md">
                            <Pin size={12} /> <Tr i18nKey="archive.picksLabel" />
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl">
                            <Tr i18nKey="archive.picksTitle" />
                        </h1>
                        <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
                            <Tr i18nKey="archive.picksSubtitle" />
                        </p>
                        
                        <div className="mt-8 mx-auto w-full max-w-md">
                            <SearchBar scope="posts" placeholder="Search picks..." compact />
                        </div>
                    </div>
                </Container>
            </div>

            <Container style={{ paddingTop: '48px', paddingBottom: '120px' }}>
                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
