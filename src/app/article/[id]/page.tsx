import { getArticleById } from '@/lib/db';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;
    const articleId = parseInt(id, 10);
    if (isNaN(articleId)) notFound();

    const article = await getArticleById(articleId);
    if (!article) notFound();

    return (
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
    );
}
