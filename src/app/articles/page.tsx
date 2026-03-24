import { getAllArticles } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import SearchBar from '@/components/SearchBar';
import type { Metadata } from 'next';
import { buildMetadata, buildItemListJsonLd } from '@/lib/seo';
import { SITE_META } from '@/lib/siteMeta';
import { extractPlainText } from '@/lib/stringUtils';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return buildMetadata({
        title: 'Articles & Editorial Picks',
        description: 'All editorial picks and feature articles curated by DaveyNFTs — in-depth reads on crypto, web3, and blockchain.',
        canonicalPath: '/articles',
        type: 'website',
        keywords: ['web3 articles', 'crypto editorial', 'blockchain features', 'DaveyNFTs', 'NFT blog'],
        allowIndexing: true,
    });
}

export default async function ArticlesPage() {
    noStore();
    const allArticles = await getAllArticles();

    const editorialPicks = allArticles
        .filter(a => a.isEditorialPick && !a.isMore)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

    const features = allArticles
        .filter(a => !a.isEditorialPick && !a.isMore)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

    const moreArticles = allArticles
        .filter(a => a.isMore)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

    const ArticleCard = ({ article, featured = false }: { article: typeof allArticles[0]; featured?: boolean }) => (
        <Link
            href={`/article/${article.id}`}
            className={`archive-article-card ${featured ? 'featured' : ''}`}
            style={{ textDecoration: 'none' }}
        >
            <div className="archive-article-image">
                {article.coverImage && article.coverImage.startsWith('http') ? (
                    <Image src={article.coverImage} alt={article.title} fill style={{ objectFit: 'cover' }} />
                ) : (
                    <div className="archive-article-image-placeholder">✍️</div>
                )}
                {article.isEditorialPick && (
                    <span className="archive-article-pick-badge">★ Tuyển Chọn</span>
                )}
            </div>
            <div className="archive-article-body">
                <span className="archive-article-date">
                    {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    }) : ''}
                </span>
                <h3 className="archive-article-title">{article.title}</h3>
                {featured && !!article.content && (
                    <p className="archive-article-excerpt">
                        {extractPlainText(article.content).slice(0, 160)}...
                    </p>
                )}
                <div className="archive-article-footer">
                    <span className="archive-article-read">Đọc Bài Viết →</span>
                    {article.xSourceUrl && (
                        <span className="archive-article-x">𝕏 Source</span>
                    )}
                </div>
            </div>
        </Link>
    );

    // Build ItemList JSON-LD for all articles
    const allVisibleArticles = [...editorialPicks, ...features];
    const itemListJsonLd = buildItemListJsonLd(
        allVisibleArticles.map(a => ({
            name: a.title,
            url: `${SITE_META.SITE_URL}/article/${a.slug || a.id}`,
        })),
        'Editorial & Feature Articles'
    );

    return (
        <div className="archive-page-container">
            {/* ItemList JSON-LD for article listing */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            {/* Hero */}
            <div className="archive-hero">
                <div className="liquid-blob blob-1" style={{ opacity: 0.25, top: '-10%', left: '-5%', background: 'var(--blog-color)' }} />
                <div className="liquid-blob blob-2" style={{ opacity: 0.15, bottom: '-20%', right: '0%' }} />
                <Container>
                    <div className="archive-hero-content">
                        <Link href="/" className="more-back-btn">← Trở về Trang chủ</Link>
                        <div style={{ marginTop: '24px' }}>
                            <span className="more-label">✍️ Toàn Bộ Bài Viết</span>
                            <h1 className="archive-hero-title">Bài Viết & Chuyên Đề</h1>
                            <p className="archive-hero-subtitle">
                                Tổng hợp bài viết phân tích, báo cáo chuyên sâu và nhận định về thị trường Web3.
                            </p>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <SearchBar scope="articles" placeholder="Search articles..." compact />
                        </div>
                        <div className="archive-hero-stats">
                            <div className="archive-stat">
                                <span className="archive-stat-num">{editorialPicks.length}</span>
                                <span className="archive-stat-label">Tuyển Chọn</span>
                            </div>
                            <div className="archive-stat-sep" />
                            <div className="archive-stat">
                                <span className="archive-stat-num">{features.length}</span>
                                <span className="archive-stat-label">Nổi Bật</span>
                            </div>
                            {moreArticles.length > 0 && (
                                <>
                                    <div className="archive-stat-sep" />
                                    <div className="archive-stat">
                                        <span className="archive-stat-num">{moreArticles.length}</span>
                                        <span className="archive-stat-label">Đã Lưu Trữ</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Container>
            </div>

            <Container style={{ paddingTop: '60px', paddingBottom: '120px' }}>
                {allArticles.length === 0 ? (
                    <div className="more-empty-state">
                        <div className="more-empty-icon">✍️</div>
                        <h2>No articles yet</h2>
                        <p>Articles added through the admin panel will appear here.</p>
                        <Link href="/admin" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '24px' }}>Go to Admin</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
                        {/* Editorial Picks */}
                        {editorialPicks.length > 0 && (
                            <section>
                                <div className="archive-section-header">
                                    <h2 className="archive-section-title">
                                        <span className="archive-section-dot" style={{ background: 'var(--blog-color)' }} />
                                        ★ Bài Viết Tuyển Chọn
                                    </h2>
                                    <span className="more-month-count">{editorialPicks.length}</span>
                                </div>
                                <div className="archive-articles-grid featured-grid">
                                    {editorialPicks.map((article, idx) => (
                                        <ArticleCard key={article.id} article={article} featured={idx === 0} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Standard Features */}
                        {features.length > 0 && (
                            <section>
                                <div className="archive-section-header">
                                    <h2 className="archive-section-title">
                                        <span className="archive-section-dot" style={{ background: 'rgba(255,255,255,0.4)' }} />
                                        Bài Viết Mới Nhất
                                    </h2>
                                    <span className="more-month-count">{features.length}</span>
                                </div>
                                <div className="archive-articles-grid">
                                    {features.map(article => (
                                        <ArticleCard key={article.id} article={article} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* More / Archived */}
                        {moreArticles.length > 0 && (
                            <section>
                                <div className="archive-section-header">
                                    <h2 className="archive-section-title">
                                        <span className="archive-section-dot" style={{ background: 'var(--text-muted)' }} />
                                        Kho Lưu Trữ Mở Rộng
                                    </h2>
                                    <span className="more-month-count">{moreArticles.length}</span>
                                </div>
                                <div className="archive-articles-grid">
                                    {moreArticles.map(article => (
                                        <ArticleCard key={article.id} article={article} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}
