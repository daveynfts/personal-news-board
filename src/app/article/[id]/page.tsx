import { getArticleById } from '@/lib/db';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
import { buildCanonicalUrl, SITE_META } from '@/lib/siteMeta';

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

// ── Article-level SEO: generateMetadata ───────────────────────────────────────
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { id } = await params;
    const articleId = parseInt(id, 10);

    if (isNaN(articleId)) {
        return buildMetadata({ allowIndexing: false });
    }

    const article = await getArticleById(articleId);

    if (!article) {
        // Don't index 404'd articles
        return buildMetadata({
            title: 'Article Not Found',
            description: 'This article could not be found.',
            allowIndexing: false,
        });
    }

    // Strip markdown syntax from content to generate a clean description
    const plainDescription = article.content
        .replace(/!\[.*?\]\(.*?\)/g, '')   // remove markdown images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace links with text
        .replace(/#{1,6}\s+/g, '')          // remove heading markers
        .replace(/[*_`~>]/g, '')            // remove emphasis/code chars
        .replace(/\n+/g, ' ')              // collapse newlines
        .trim()
        .slice(0, 155);

    return buildMetadata({
        title: article.title,
        description: plainDescription || `Read the full article: ${article.title}`,
        canonicalPath: `/article/${article.id}`,
        ogImage: article.coverImage || SITE_META.DEFAULT_OG_IMAGE,
        type: 'article',
        publishedTime: article.createdAt
            ? new Date(article.createdAt).toISOString()
            : new Date().toISOString(),
        authorName: SITE_META.AUTHOR_NAME,
        keywords: [
            'crypto article',
            'web3',
            'blockchain',
            article.isEditorialPick ? 'editorial pick' : 'feature article',
            'DaveyNFTs',
        ],
        allowIndexing: true,
    });
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;
    const articleId = parseInt(id, 10);
    if (isNaN(articleId)) notFound();

    const article = await getArticleById(articleId);
    if (!article) notFound();

    const canonicalUrl = buildCanonicalUrl(`/article/${article.id}`);

    // Plain text description (same logic as in generateMetadata)
    const plainDescription = article.content
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .replace(/[*_`~>]/g, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 155);

    // JSON-LD payloads
    const articleJsonLd = buildArticleJsonLd({
        title: article.title,
        description: plainDescription,
        url: canonicalUrl,
        imageUrl: article.coverImage || SITE_META.DEFAULT_OG_IMAGE,
        publishedTime: article.createdAt
            ? new Date(article.createdAt).toISOString()
            : new Date().toISOString(),
        authorName: SITE_META.AUTHOR_NAME,
    });

    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: 'Home', url: SITE_META.SITE_URL },
        { name: 'Articles', url: `${SITE_META.SITE_URL}/` },
        { name: article.title, url: canonicalUrl },
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
                    Back to Feed
                </Link>

                {/* Hero / Cover Image */}
                {article.coverImage && (
                    <div className="article-cover" style={{ backgroundImage: `url(${article.coverImage})` }}>
                        <div className="article-cover-overlay" />
                    </div>
                )}

                {/* Article Header */}
                <header className="article-header">
                    <span className="article-editorial-badge">
                        {article.isEditorialPick ? '★ Editorial Pick' : 'Feature Article'}
                    </span>
                    <h1 className="article-title">{article.title}</h1>
                    <div className="article-meta">
                        <span>
                            {new Date(article.createdAt || '').toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--text-muted)' }}>By {SITE_META.AUTHOR_NAME}</span>
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
                                View on X
                            </a>
                        )}
                    </div>
                </header>

                {/* Article Body */}
                <article className="article-body">
                    <ReactMarkdown>{article.content}</ReactMarkdown>
                </article>

                {/* Footer attribution */}
                {article.xSourceUrl && (
                    <div className="article-source-footer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.15H5.059z" />
                        </svg>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#fff' }}>X Source</p>
                            <a href={article.xSourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', wordBreak: 'break-all' }}>
                                {article.xSourceUrl}
                            </a>
                        </div>
                    </div>
                )}

                {/* Back to feed CTA */}
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <Link href="/" className="submit-btn" style={{ display: 'inline-block', padding: '14px 40px', textDecoration: 'none' }}>
                        ← Back to All Picks
                    </Link>
                </div>
            </div>
        </>
    );
}
