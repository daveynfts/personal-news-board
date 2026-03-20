import { getAllPosts, getAllArticles } from '@/lib/db';
import Container from '@/components/Container';
import NewsGridClient from './NewsGridClient';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewsArchivePage() {
  const allPosts = await getAllPosts();
  const allArticles = await getAllArticles();
  
  const formattedNews = allPosts
    .filter(p => p.type.toLowerCase() === 'news' || p.type.toLowerCase() === 'research')
    .map(p => ({
      id: p.id,
      title: p.title,
      url: p.url,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      type: 'Research',
      isMore: p.isMore
    }));

  const formattedArticles = allArticles.map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    imageUrl: a.coverImage,
    createdAt: a.createdAt,
    type: 'Article',
    isMore: a.isMore
  }));

  const combinedItems = [...formattedNews, ...formattedArticles].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="archive-page-container min-h-screen pb-24">
      {/* Hero Section */}
      <div className="archive-hero relative overflow-hidden">
        <div className="liquid-blob blob-1" style={{ opacity: 0.15, top: '-10%', left: '-5%', background: 'var(--news-color)' }} />
        <div className="liquid-blob blob-3" style={{ opacity: 0.1, top: '30%', right: '10%' }} />
        
        <Container className="relative z-10 pt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-white transition-colors opacity-80 hover:opacity-100">
            <span>&larr;</span> Trở về Trang chủ
          </Link>

          <div className="archive-hero-content text-center max-w-3xl mx-auto pt-6 pb-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl">
              DaveyNFTs' Studio
            </h1>
          </div>
        </Container>
      </div>

      {/* Grid Content */}
      <Container className="relative z-10 pt-8">
         <NewsGridClient items={combinedItems} />
      </Container>
    </div>
  );
}
