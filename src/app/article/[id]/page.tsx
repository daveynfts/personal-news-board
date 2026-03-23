import { getArticleById, getRelatedArticles } from '@/lib/db';
import { notFound } from 'next/navigation';
import ArticleContent from '@/components/ArticleContent';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { buildMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
import { buildCanonicalUrl, SITE_META } from '@/lib/siteMeta';

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

export const revalidate = 60; // Thêm tự động làm mới Cache mỗi 60s (Sửa lỗi 404 kẹt Cache trên Vercel)

// ── Article-level SEO: generateMetadata ───────────────────────────────────────
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { id } = await params;

    const article = await getArticleById(id);

    if (!article) {
        // Don't index 404'd articles
        return buildMetadata({
            title: 'Article Not Found',
            description: 'This article could not be found.',
            allowIndexing: false,
        });
    }

  function extractPlainText(content: any): string {
      if (!content) return '';
      if (typeof content === 'string') {
          return content
              .replace(/!\[.*?\]\(.*?\)/g, '')   // remove markdown images
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace links with text
              .replace(/#{1,6}\s+/g, '')          // remove heading markers
              .replace(/[*_`~>]/g, '')            // remove emphasis/code chars
              .replace(/\n+/g, ' ')              // collapse newlines
              .trim();
      }
      if (Array.isArray(content)) {
          return content
              .map(block => {
                  if (block._type !== 'block' || !block.children) {
                      return '';
                  }
                  return block.children.map((child: any) => child.text).join('');
              })
              .join(' ')
              .trim();
      }
      return '';
  }

  const plainDescription = extractPlainText(article.content).slice(0, 155);

  const seoTitle = article.seo?.metaTitle || article.title;
  const seoDescription = article.seo?.metaDescription || plainDescription || `Read the full article: ${article.title}`;
  const seoImage = article.seo?.openGraphImage ? article.seo.openGraphImage : (article.coverImage || SITE_META.DEFAULT_OG_IMAGE);

  const allowIndexing = article.seo?.isIndexable !== false;
  // Use original source URL as priority for Canonical Tag (prevents duplicate content)
  const customCanonical = article.seo?.originalSourceUrl || article.seo?.canonicalUrl || `/article/${article.slug || article.id}`;

  return buildMetadata({
        title: seoTitle,
        description: seoDescription,
        canonicalPath: customCanonical,
        ogImage: seoImage,
        type: 'article',
        publishedTime: article.createdAt
            ? new Date(article.createdAt).toISOString()
            : new Date().toISOString(),
        modifiedTime: article.updatedAt
            ? new Date(article.updatedAt).toISOString()
            : undefined,
        authorName: SITE_META.AUTHOR_NAME,
        keywords: [
            article.seo?.focusKeyword || '',
            'crypto article',
            'web3',
            'blockchain',
            article.isEditorialPick ? 'editorial pick' : 'feature article',
            'DaveyNFTs',
        ].filter(Boolean),
        allowIndexing: allowIndexing,
    });
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;
    if (!id) notFound();

    const article = await getArticleById(id);
    if (!article) notFound();

    const relatedArticles = await getRelatedArticles(article.id as string, article.category, 3);

    const customCanonical = article.seo?.originalSourceUrl || article.seo?.canonicalUrl 
        ? (article.seo?.originalSourceUrl || article.seo?.canonicalUrl)
        : buildCanonicalUrl(`/article/${article.slug || article.id}`);

    function extractPlainText(content: any): string {
        if (!content) return '';
        if (typeof content === 'string') {
            return content
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/#{1,6}\s+/g, '')
                .replace(/[*_`~>]/g, '')
                .replace(/\n+/g, ' ')
                .trim();
        }
        if (Array.isArray(content)) {
            return content
                .map(block => {
                    if (block._type !== 'block' || !block.children) {
                        return '';
                    }
                    return block.children.map((child: any) => child.text).join('');
                })
                .join(' ')
                .trim();
        }
        return '';
    }

    const plainDescription = extractPlainText(article.content).slice(0, 155);

    const seoTitle = article.seo?.metaTitle || article.title;
    const seoDescription = article.seo?.metaDescription || plainDescription || `Read the full article: ${article.title}`;
    const seoImage = article.seo?.openGraphImage ? article.seo.openGraphImage : (article.coverImage || SITE_META.DEFAULT_OG_IMAGE);

    // JSON-LD payloads
    const articleJsonLd = buildArticleJsonLd({
        title: seoTitle,
        description: seoDescription,
        url: customCanonical,
        imageUrl: seoImage,
        publishedTime: article.createdAt
            ? new Date(article.createdAt).toISOString()
            : new Date().toISOString(),
        modifiedTime: article.updatedAt
            ? new Date(article.updatedAt).toISOString()
            : undefined,
        authorName: SITE_META.AUTHOR_NAME,
    });

    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: 'Trang Chủ', url: SITE_META.SITE_URL },
        { name: 'Bài Viết', url: `${SITE_META.SITE_URL}/` },
        { name: seoTitle, url: customCanonical },
    ]);

    return (
        <>
            {/* NewsArticle JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
            {/* BreadcrumbList JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <div className="article-page-layout">
                {/* Back navigation */}
                <Link href="/" className="article-back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Trở về danh sách
                </Link>

                {/* Hero / Cover Image */}
                {article.coverImage && (
                    <div className="article-cover" style={{ position: 'relative' }}>
                        <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
                        />
                        <div className="article-cover-overlay" />
                    </div>
                )}

                {/* Article Header */}
                <header className="article-header">
                    <span className="article-editorial-badge">
                        {article.isEditorialPick ? '★ Bài Viết Tuyển Chọn' : 'Bài Viết Nổi Bật'}
                    </span>
                    <h1 className="article-title">{article.title}</h1>
                    <div className="article-meta">
                        <span>
                            {new Date(article.createdAt || '').toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        {article.updatedAt && (new Date(article.updatedAt).getTime() - new Date(article.createdAt || 0).getTime() > 120000) && (
                            <>
                                <span style={{ color: 'var(--text-muted)' }}>·</span>
                                <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                                    Cập nhật: {new Date(article.updatedAt).toLocaleString('vi-VN', {
                                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
                                    })}
                                </span>
                            </>
                        )}
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--text-muted)' }}>Bởi {SITE_META.AUTHOR_NAME}</span>
                        {article.xSourceUrl && (
                            <a
                                href={article.xSourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="article-x-source"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.15H5.059z" />
                                </svg>
                                Xem trên X
                            </a>
                        )}
                    </div>
                </header>

                {/* Article Body */}
                <article className="article-body">
                    <ArticleContent content={article.content} />

                    {/* Davey's Take / Key Takeaway (Unique Value for SEO) */}
                    {article.daveysTake && (
                        <div className="daveys-take-box" style={{ marginTop: '60px' }}>
                            <h3 className="daveys-take-title">
                                <span className="daveys-take-text">Góc Nhìn Của DaveyNFTs</span>
                            </h3>
                            <p className="daveys-take-content">{article.daveysTake}</p>
                        </div>
                    )}
                </article>

                {/* Footer attribution */}
                {article.seo?.originalSourceUrl && (
                    <div className="article-source-footer original-source">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#fff' }}>Nguồn Bài Viết</p>
                            <a href={article.seo.originalSourceUrl} target="_blank" rel="noopener nofollow" style={{ color: 'var(--accent-color)' }}>
                                {article.seo?.originalSourceName ? `Đọc bài gốc tại ${article.seo.originalSourceName}` : 'Đọc toàn bộ bài gốc'} →
                            </a>
                        </div>
                    </div>
                )}

                {article.xSourceUrl && (
                    <div className="article-source-footer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.15H5.059z" />
                        </svg>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#fff' }}>Nguồn X (Twitter)</p>
                            <a href={article.xSourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', wordBreak: 'break-all' }}>
                                {article.xSourceUrl}
                            </a>
                        </div>
                    </div>
                )}

                {/* Related Articles Styles */}
                <style dangerouslySetInnerHTML={{ __html: `
                    .related-articles-section {
                        margin-top: 60px;
                        padding-top: 40px;
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .related-articles-title {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin-bottom: 24px;
                        color: #fff;
                    }
                    .related-articles-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                        gap: 20px;
                    }
                    .related-article-card {
                        display: flex;
                        flex-direction: column;
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 16px;
                        overflow: hidden;
                        text-decoration: none;
                        transition: all 0.3s ease;
                    }
                    .related-article-card:hover {
                        transform: translateY(-4px);
                        background: rgba(255, 255, 255, 0.05);
                        border-color: rgba(255, 255, 255, 0.1);
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    }
                    .related-article-image {
                        width: 100%;
                        height: 160px;
                        background-size: cover;
                        background-position: center;
                    }
                    .related-article-content {
                        padding: 20px;
                    }
                    .related-article-category {
                        font-size: 0.75rem;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: rgba(255,255,255,0.6);
                        font-weight: 600;
                        margin-bottom: 8px;
                        display: block;
                    }
                    .related-article-heading {
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: #fff;
                        margin: 0;
                        line-height: 1.4;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                `}} />

                {/* Related Articles Section */}
                {relatedArticles && relatedArticles.length > 0 && (
                    <div className="related-articles-section">
                        <h2 className="related-articles-title">Tin cùng chuyên mục</h2>
                        <div className="related-articles-grid">
                            {relatedArticles.map((rel) => (
                                <Link href={`/article/${rel.slug || rel.id}`} key={rel.id} className="related-article-card">
                                    <div className="related-article-image" style={{ position: 'relative', overflow: 'hidden' }}>
                                        <Image
                                            src={rel.coverImage || SITE_META.DEFAULT_OG_IMAGE}
                                            alt={rel.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, 300px"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="related-article-content">
                                        <span className="related-article-category">{rel.category || 'Tin tức'}</span>
                                        <h3 className="related-article-heading">{rel.title}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to feed CTA */}
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <Link href="/" className="submit-btn" style={{ display: 'inline-block', padding: '14px 40px', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                        ← Xem tất cả bài viết
                    </Link>
                </div>
            </div>
        </>
    );
}
