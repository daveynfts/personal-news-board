import { getAllPosts, getAllArticles, getAllEvents } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import PostCard from '@/components/PostCard';
import EditorialCarousel from '@/components/EditorialCarousel';
import EventCalendar from '@/components/EventCalendar';
import Container from '@/components/Container';
import FilterBar from '@/components/FilterBar';
import TweetWall from '@/components/TweetWall';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { HeroText, SectionHeader, EmptyState } from '@/components/TranslatableText';
import NewsHero from '@/components/NewsHero';
import DragScrollContainer from '@/components/DragScrollContainer';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

// ── Homepage SEO ─────────────────────────────────────────────────────────────
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { filter } = await searchParams;

  // Map filter slug → human-readable label for richer title/description
  const filterLabels: Record<string, { label: string; desc: string }> = {
    research: { label: 'Top Research', desc: 'In-depth research and analysis curated by DaveyNFTs.' },
    article:  { label: 'Top Articles', desc: 'Insightful articles and long-form reads selected by DaveyNFTs.' },
    x:        { label: 'X Thread Picks', desc: 'The best X (Twitter) threads and takes, curated by DaveyNFTs.' },
  };

  const activeFilter = filter && filter !== 'all' ? filterLabels[filter.toLowerCase()] : null;

  return buildMetadata({
    title: activeFilter ? activeFilter.label : undefined,  // undefined → DEFAULT_TITLE
    description: activeFilter
      ? activeFilter.desc
      : 'A premium, personal collection of top news, insightful blogs, and curated X threads. Discover elite web3 content.',
    canonicalPath: activeFilter ? `/?filter=${filter}` : '/',
    type: 'website',
    keywords: ['crypto news', 'web3', 'blockchain', 'DaveyNFTs', 'NFT', 'DeFi', 'curated news', filter ?? 'all'].filter(Boolean),
    allowIndexing: true,
  });
}

export default async function Home({ searchParams }: PageProps) {
  noStore();
  const { filter } = await searchParams;
  const allPosts = await getAllPosts();
  const allArticles = await getAllArticles();
  const allEvents = await getAllEvents();

  const filteredPosts = filter && filter !== 'all'
    ? allPosts.filter(p => p.type.toLowerCase() === filter.toLowerCase() && !p.isMore)
    : allPosts.filter(p => !p.isMore);

  const editorialPicks = allArticles.filter(a => a.isEditorialPick && !a.isMore);
  const hotStories = allArticles.filter(a => a.isHotStory && !a.isMore);
  const featuredArticles = allArticles.filter(a => !a.isMore).slice(0, 3);
  const standardArticles = allArticles.filter(a => !a.isEditorialPick && !a.isHotStory && !a.isMore);

  const visibleEvents = allEvents.filter(e => !e.isMore);



  return (
    <div className="home-container">
      {/* Animated background blobs (macOS Dark Mode logic) */}
      <div className="so-bg-effects">
        <div className="so-blob so-blob-1" />
        <div className="so-blob so-blob-2" />
        <div className="so-blob so-blob-3" />
      </div>



      {/* 1. NEWS (Top Level Container) */}
      <Container style={{ marginTop: '30px', marginBottom: '60px' }}>
        <NewsHero 
           featuredArticles={featuredArticles}
           editorChoices={editorialPicks}
           hotStories={hotStories}
           latestNews={allArticles.filter(a => !a.isMore)}
        />
      </Container>

      {/* 2. X PICK (FEATURED TWEETS) */}
      <Container style={{ marginBottom: '60px' }}>
        <TweetWall />
      </Container>

      {/* 3. EVENT CALENDAR */}
      {visibleEvents.length > 0 && (
        <Container style={{ marginBottom: '60px' }}>
          <EventCalendar events={visibleEvents} />
        </Container>
      )}

      {/* CURATION FEED (POSTS) */}
      <Container style={{ marginTop: '80px', marginBottom: '100px' }}>
        <SectionHeader
          titleKey="section.daveyPicks"
          viewAllKey="btn.viewAllPicks"
          viewAllHref="/picks"
        />
        
        <Suspense fallback={
          <div className="filter-container" style={{ margin: '0 auto 48px' }}>
            {['All', 'Research', 'Article'].map(cat => (
              <span key={cat} className="filter-btn">{cat}</span>
            ))}
          </div>
        }>
          <FilterBar />
        </Suspense>

        <section className="feed">
          {filteredPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="rainbow-glow-container">
              <div className="marquee-wrapper" style={{ padding: '0 20px' }}>
                <DragScrollContainer className="mb-6">
                  {filteredPosts.slice(0, Math.ceil(filteredPosts.length / 2)).map((post) => (
                    <div key={post.id} style={{ flex: '0 0 auto', display: 'flex' }}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </DragScrollContainer>
                
                {filteredPosts.length > 1 && (
                  <DragScrollContainer>
                    {filteredPosts.slice(Math.ceil(filteredPosts.length / 2)).map((post) => (
                      <div key={post.id} style={{ flex: '0 0 auto', display: 'flex' }}>
                        <PostCard post={post} />
                      </div>
                    ))}
                  </DragScrollContainer>
                )}
              </div>
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
