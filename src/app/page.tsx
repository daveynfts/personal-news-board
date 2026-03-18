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

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

// ── Homepage SEO ─────────────────────────────────────────────────────────────
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { filter } = await searchParams;

  // Map filter slug → human-readable label for richer title/description
  const filterLabels: Record<string, { label: string; desc: string }> = {
    news:  { label: 'Top News',        desc: 'Breaking news and top headlines curated by DaveyNFTs.' },
    blog:  { label: 'Blog Picks',      desc: 'Insightful blog posts and long-form reads selected by DaveyNFTs.' },
    x:     { label: 'X Thread Picks',  desc: 'The best X (Twitter) threads and takes, curated by DaveyNFTs.' },
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
  const standardArticles = allArticles.filter(a => !a.isEditorialPick && !a.isMore);

  const visibleEvents = allEvents.filter(e => !e.isMore);



  return (
    <div className="home-container">
      {visibleEvents.length > 0 ? (
        <Container style={{ marginTop: '16px' }}>
          <EventCalendar events={visibleEvents} />
        </Container>
      ) : (
        <div className="hero-wrapper" style={{ margin: '40px auto 60px', padding: '0 20px' }}>
          <div className="liquid-blob blob-1"></div>
          <div className="liquid-blob blob-2"></div>
          <div className="liquid-blob blob-3"></div>
          <section className="hero hero-glass-container">
            <HeroText />
          </section>
        </div>
      )}


      {/* EDITORIAL CAROUSEL */}
      {editorialPicks.length > 0 && (
        <section style={{ margin: '0 auto 60px', width: '100%', maxWidth: '1200px' }}>
          <EditorialCarousel articles={editorialPicks} />
        </section>
      )}

      {/* ARTICLE ARCHIVE - Bento Box Hero Section */}
      {standardArticles.length > 0 && (
        <section className="articles-archive">
          <Container>
            <SectionHeader
              titleKey="section.latestFeatures"
              viewAllKey="btn.viewAllArticles"
              viewAllHref="/articles"
            />
            <div className="bento-grid">
              {standardArticles.map((article, index) => (
                <Link 
                  href={`/article/${article.id}`} 
                  key={article.id} 
                  className={`bento-item ${index === 0 ? 'bento-featured' : 'bento-standard'}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="post-card" style={{ width: '100%' }}>
                    {article.coverImage && (
                      <div 
                        className="feature-card-media"
                        style={{ 
                          backgroundImage: `url(${article.coverImage})`,
                          height: index === 0 ? '400px' : '200px' 
                        }} 
                      />
                    )}
                    <div className="post-card-body">
                      <span className="type-tag" style={{ background: 'var(--blog-color)', position: index === 0 ? 'absolute' : 'static', marginBottom: index === 0 ? '0' : '16px', display: 'inline-block' }}>Editorial</span>
                      <h3 className="post-title" style={{ fontSize: index === 0 ? '2.5rem' : '1.4rem' }}>{article.title}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                        {new Date(article.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FEATURED TWEETS */}
      <Container>
        <TweetWall />
      </Container>

      {/* CURATION FEED (POSTS) */}
      <Container style={{ marginTop: '80px', marginBottom: '100px' }}>
        <SectionHeader
          titleKey="section.daveyPicks"
          viewAllKey="btn.viewAllPicks"
          viewAllHref="/picks"
        />
        
        <Suspense fallback={
          <div className="filter-container" style={{ margin: '0 auto 48px' }}>
            {['All', 'News', 'Blog', 'X'].map(cat => (
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
              <div className="marquee-wrapper">
                <div className="marquee-content left-to-right">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {/* Duplicate set for infinite scroll effect */}
                  {filteredPosts.map((post) => (
                    <PostCard key={`dup-${post.id}`} post={post} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
