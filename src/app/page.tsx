import { getAllPosts, getAllArticles, getAllEvents } from '@/lib/db';
import PostCard from '@/components/PostCard';
import EditorialCarousel from '@/components/EditorialCarousel';
import EventCalendar from '@/components/EventCalendar';
import Container from '@/components/Container';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { filter } = await searchParams;
  const allPosts = await getAllPosts();
  const allArticles = await getAllArticles();
  const allEvents = await getAllEvents();

  const filteredPosts = filter && filter !== 'all'
    ? allPosts.filter(p => p.type.toLowerCase() === filter.toLowerCase())
    : allPosts;

  const editorialPicks = allArticles.filter(a => a.isEditorialPick);
  const standardArticles = allArticles.filter(a => !a.isEditorialPick);

  const categories = ['All', 'News', 'Blog', 'X'];

  return (
    <div className="home-container">
      {allEvents.length > 0 ? (
        <Container style={{ marginTop: '40px' }}>
          <EventCalendar events={allEvents} />
        </Container>
      ) : (
        <section className="hero">
          <h2>Your Curated Universe.</h2>
          <p>A personal collection of top news, insightful blogs, and interesting X threads, built for elite curation.</p>
        </section>
      )}

      {/* EDITORIAL CAROUSEL */}
      {(!filter || filter === 'all') && editorialPicks.length > 0 && (
        <section style={{ margin: '0 auto 60px', width: '100%', maxWidth: '1200px' }}>
          <EditorialCarousel articles={editorialPicks} />
        </section>
      )}

      {/* ARTICLE ARCHIVE */}
      {(!filter || filter === 'all') && standardArticles.length > 0 && (
        <section className="articles-archive" style={{ margin: '0 auto 60px', width: '100%', maxWidth: '1200px' }}>
          <h2 className="section-title" style={{ marginBottom: '24px' }}>Latest Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {standardArticles.map(article => (
              <Link href={`/article/${article.id}`} key={article.id} style={{ textDecoration: 'none' }}>
                <div className="post-card trans-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {article.coverImage && (
                    <div style={{ height: '160px', width: '100%', backgroundImage: `url(${article.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--border-color)' }} />
                  )}
                  <div className="post-content" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span className="type-tag" style={{ background: 'var(--text-color)', color: 'var(--bg-color)', width: 'fit-content', marginBottom: '12px' }}>Editorial</span>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>{article.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                      {new Date(article.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CURATION FEED (POSTS) */}
      <h2 className="section-title" style={{ marginBottom: '24px', textAlign: 'center' }}>DaveyNFTs&apos; Picks</h2>
      <div className="filter-container">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={cat === 'All' ? '/' : `/?filter=${cat.toLowerCase()}`}
            className={`filter-btn ${(!filter && cat === 'All') || filter === cat.toLowerCase() ? 'active' : ''}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <section className="feed" style={{ marginTop: '20px' }}>
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
    </div>
  );
}
