import type { MetadataRoute } from 'next';
import { SITE_META } from '@/lib/siteMeta';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio/', '/api/', '/_next/'],
      },
    ],
    sitemap: `${SITE_META.SITE_URL}/sitemap.xml`,
  };
}
