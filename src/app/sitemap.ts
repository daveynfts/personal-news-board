import { MetadataRoute } from 'next';
import { getAllArticles, getAllEvents, getAllPosts } from '@/lib/db';
import { SITE_META } from '@/lib/siteMeta';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_META.SITE_URL;

  // 1. Core Static Pages
  const staticRoutes = [
    '',
    '/special-offer',
    '/api/search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as "daily",
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Fetch all dynamic content
  const [articles] = await Promise.all([
    getAllArticles(),
    // We can add events or others if they have dedicated valid NextJS pages
  ]);

  // 3. Map Articles
  const articleRoutes = articles
    .filter((a) => a.seo?.isIndexable !== false)
    .map((article) => ({
      url: article.seo?.canonicalUrl || `${baseUrl}/article/${article.slug || article.id}`,
      lastModified: new Date(article.createdAt || new Date()).toISOString(),
      changeFrequency: 'weekly' as "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...articleRoutes];
}
