import { getEmbeddedTweets } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import Container from '@/components/Container';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import TweetArchiveGrid from './TweetArchiveGrid';
import Link from 'next/link';
import { Tr } from '@/components/TranslatableText';

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
            <div className="archive-hero relative overflow-hidden">
                <div className="liquid-blob blob-1" style={{ opacity: 0.15, top: '-10%', left: '-5%', background: 'var(--x-color, #1da1f2)' }} />
                <div className="liquid-blob blob-3" style={{ opacity: 0.1, bottom: '-20%', right: '10%' }} />
                
                <Container className="relative z-10 pt-6">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-white transition-colors opacity-80 hover:opacity-100">
                        <Tr i18nKey="btn.backToHome" />
                    </Link>

                    <div className="archive-hero-content text-center max-w-3xl mx-auto pt-6 pb-8">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold tracking-widest uppercase text-gray-300 mb-6 drop-shadow-sm backdrop-blur-md">
                            𝕏 Full Archive
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl">
                            Featured X Posts
                        </h1>
                        <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
                            All curated posts from the crypto community — breaking news, analysis, alpha insights, and threads.
                        </p>
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
