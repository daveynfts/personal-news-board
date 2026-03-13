import { getAllPosts, getAllArticles, getAllEvents } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import PostCard from '@/components/PostCard';
import EditorialCarousel from '@/components/EditorialCarousel';
import EventCalendar from '@/components/EventCalendar';
import Container from '@/components/Container';
import FilterBar from '@/components/FilterBar';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  noStore();
  const { filter } = await searchParams;
  const allPosts = await getAllPosts();
  const allArticles = await getAllArticles();
  const allEvents = await getAllEvents();

  const filteredPosts = filter && filter !== 'all'
    ? allPosts.filter(p => p.type.toLowerCase() === filter.toLowerCase())
    : allPosts;

  const editorialPicks = allArticles.filter(a => a.isEditorialPick);
  const standardArticles = allArticles.filter(a => !a.isEditorialPick);


  return (
    <div className="home-container">
      {allEvents.length > 0 ? (
        <Container style={{ marginTop: '16px' }}>
          <EventCalendar events={allEvents} />
        </Container>
      ) : (
        <div className="hero-wrapper" style={{ margin: '40px auto 60px', padding: '0 20px' }}>
          <div className="liquid-blob blob-1"></div>
          <div className="liquid-blob blob-2"></div>
          <div className="liquid-blob blob-3"></div>
          <section className="hero hero-glass-container">
            <h2>Your Curated Universe.</h2>
            <p>A personal collection of top news, insightful blogs, and interesting X threads, built for elite curation.</p>
          </section>
        </div>
      )}

      {/* EDITORIAL CAROUSEL */}
      {(!filter || filter === 'all') && editorialPicks.length > 0 && (
        <section style={{ margin: '0 auto 60px', width: '100%', maxWidth: '1200px' }}>
          <EditorialCarousel articles={editorialPicks} />
        </section>
      )}

      {/* ARTICLE ARCHIVE - Bento Box Hero Section */}
      {(!filter || filter === 'all') && standardArticles.length > 0 && (
        <section className="articles-archive">
          <Container>
            <h2 className="section-title">Latest Features</h2>
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

      {/* CURATION FEED (POSTS) */}
      <Container style={{ marginTop: '80px', marginBottom: '100px' }}>
        <h2 className="section-title" style={{ marginBottom: '32px' }}>DaveyNFTs&apos; Picks</h2>
        
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
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" />
              </svg>
              <p>No posts found for this category. <br />Add some magic in the admin panel!</p>
            </div>
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
