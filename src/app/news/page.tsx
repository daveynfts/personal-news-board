import { getAllArticles } from '@/lib/db';
import Container from '@/components/Container';
import NewsGridClient from './NewsGridClient';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import { buildMetadata, buildItemListJsonLd } from '@/lib/seo';
import { SITE_META } from '@/lib/siteMeta';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return buildMetadata({
        title: "All Articles — Research & Articles",
        description: 'All research posts and articles curated by DaveyNFTs — your daily dose of crypto, web3, and blockchain insights.',
        canonicalPath: '/news',
        type: 'website',
        keywords: ['crypto news', 'web3 research', 'blockchain articles', 'DaveyNFTs', 'crypto analysis'],
        allowIndexing: true,
    });
}

export default async function NewsArchivePage() {
  const allArticles = await getAllArticles();
  
  const formattedArticles = allArticles.map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    imageUrl: a.coverImage,
    createdAt: a.createdAt,
    type: 'Article', url: `/article/${a.slug || a.id}`,
    isMore: a.isMore
  }));

  const combinedItems = [...formattedArticles].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
  // Build ItemList JSON-LD
  const itemListJsonLd = buildItemListJsonLd(
    combinedItems.filter(i => !i.isMore).slice(0, 50).map(item => ({
      name: item.title,
      url: 'slug' in item && item.slug
        ? `${SITE_META.SITE_URL}/article/${item.slug}`
        : ('url' in item && item.url ? item.url as string : `${SITE_META.SITE_URL}/article/${item.id}`),
    })),
    "All Articles"
  );

  return (
    <div className="archive-page-container min-h-screen pb-24">
      {/* ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
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
              All Articles
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
