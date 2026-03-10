import { getAllPosts } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { filter } = await searchParams;
  const allPosts = await getAllPosts();

  const filteredPosts = filter && filter !== 'all'
    ? allPosts.filter(p => p.type.toLowerCase() === filter.toLowerCase())
    : allPosts;

  const categories = ['All', 'News', 'Blog', 'X'];

  return (
    <div className="home-container">
      <section className="hero">
        <h2>Your Curated Universe.</h2>
        <p>A personal collection of top news, insightful blogs, and interesting X threads, built for elite curation.</p>
      </section>

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
    </div>
  );
}
