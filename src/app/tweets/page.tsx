import { getEmbeddedTweets } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import Container from '@/components/Container';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import TweetArchiveGrid from './TweetArchiveGrid';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return buildMetadata({
        title: 'Featured X Posts',
        description: 'All curated X/Twitter posts from the crypto community — breaking news, analysis, alpha, and threads.',
        canonicalPath: '/tweets',
        type: 'website',
        keywords: ['crypto twitter', 'web3', 'X posts', 'DaveyNFTs', 'crypto community'],
        allowIndexing: true,
    });
}

export default async function TweetsArchivePage() {
    noStore();
    const tweets = await getEmbeddedTweets();

    return (
        <div className="archive-page-container">
            {/* Hero */}
            <div className="archive-hero">
                <div className="archive-hero-bg">
                    <div className="liquid-blob blob-1" style={{ opacity: 0.4, top: '-20%', left: '10%' }} />
                    <div className="liquid-blob blob-2" style={{ opacity: 0.3, bottom: '-10%', right: '5%' }} />
                </div>
                <Container>
                    <div className="archive-hero-content">
                        <span className="archive-hero-label">𝕏 Full Archive</span>
                        <h1 className="archive-hero-title">Featured X Posts</h1>
                        <p className="archive-hero-subtitle">
                            All curated posts from the crypto community — breaking news, analysis, alpha insights, and threads.
                        </p>
                        <div className="archive-hero-stats">
                            <div className="archive-stat">
                                <span className="archive-stat-number">{tweets.length}</span>
                                <span className="archive-stat-label">Total Posts</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Content */}
            <Container style={{ paddingTop: '60px', paddingBottom: '120px' }}>
                <TweetArchiveGrid tweets={tweets.map(t => ({
                    id: t.id!,
                    tweetId: t.tweetId,
                    label: t.label || '',
                    category: t.category || 'general',
                }))} />
            </Container>
        </div>
    );
}
