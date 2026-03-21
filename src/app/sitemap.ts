import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/db';
import { SITE_META } from '@/lib/siteMeta';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_META.SITE_URL;

  // 1. Core Static Pages — all public-facing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/news`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/articles`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/picks`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/events`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/crypto-events`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/tweets`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/more`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  // 2. Fetch all dynamic content
  const articles = await getAllArticles();

  // 3. Map Articles
  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter((a) => a.seo?.isIndexable !== false)
    .map((article) => ({
      url: article.seo?.canonicalUrl || `${baseUrl}/article/${article.slug || article.id}`,
      lastModified: new Date(article.createdAt || new Date()).toISOString(),
      changeFrequency: 'weekly' as const,
      priority: article.isEditorialPick ? 0.8 : 0.7,
    }));

  return [...staticRoutes, ...articleRoutes];
}

