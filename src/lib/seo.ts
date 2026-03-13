/**
 * seo.ts — Dynamic Metadata Builder Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides `buildMetadata()` for use with Next.js App Router `generateMetadata`
 * and `buildArticleJsonLd()` / `buildWebSiteJsonLd()` for JSON-LD injection.
 *
 * Usage in any Server Component:
 *   export async function generateMetadata(): Promise<Metadata> {
 *     return buildMetadata({ title: 'My Page', ... });
 *   }
 */

import type { Metadata } from 'next';
import { SITE_META, buildCanonicalUrl, buildTitle } from '@/lib/siteMeta';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageType = 'website' | 'article';

export interface SeoProps {
  /** Page-specific title (without site name suffix). Omit to use default. */
  title?: string;

  /** Page-specific meta description. Omit to use default. */
  description?: string;

  /**
   * Absolute path for the canonical URL, e.g. '/article/42'.
   * Defaults to '/' (homepage).
   */
  canonicalPath?: string;

  /**
   * Absolute URL for the Open Graph / Twitter image.
   * Should be 1200×630 px for best compatibility.
   * Defaults to SITE_META.DEFAULT_OG_IMAGE.
   */
  ogImage?: string;

  /** 'website' for index pages, 'article' for individual news/article pages. */
  type?: PageType;

  /**
   * ISO 8601 timestamp of publish date — required when type === 'article'.
   * Example: '2026-03-13T09:00:00Z'
   */
  publishedTime?: string;

  /** Author display name. Defaults to SITE_META.AUTHOR_NAME. */
  authorName?: string;

  /**
   * Keywords / tags for the article (renders as <meta name="keywords">).
   * Provide an array; they'll be joined into a comma-separated string.
   */
  keywords?: string[];

  /**
   * Control indexing. Defaults to true (index, follow).
   * Set to false for admin pages, error pages, etc.
   */
  allowIndexing?: boolean;
}

// ─── Core metadata builder ────────────────────────────────────────────────────

/**
 * Generates a complete Next.js `Metadata` object compatible with App Router.
 * Cover: standard tags, Open Graph, Twitter Cards, and robots directives.
 */
export function buildMetadata(props: SeoProps = {}): Metadata {
  const {
    title,
    description = SITE_META.DEFAULT_DESCRIPTION,
    canonicalPath = '/',
    ogImage = SITE_META.DEFAULT_OG_IMAGE,
    type = 'website',
    publishedTime,
    authorName = SITE_META.AUTHOR_NAME,
    keywords = [],
    allowIndexing = true,
  } = props;

  const fullTitle = buildTitle(title);
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const robotsValue = allowIndexing ? 'index, follow' : 'noindex, nofollow';

  // Truncate description to recommended 155 chars for SERPs
  const safeDescription =
    description.length > 155 ? `${description.slice(0, 152)}...` : description;

  return {
    // ── Standard ──────────────────────────────────────────────────────────
    title: fullTitle,
    description: safeDescription,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: [{ name: authorName, url: SITE_META.AUTHOR_URL }],
    creator: SITE_META.AUTHOR_NAME,
    publisher: SITE_META.SITE_NAME,
    robots: robotsValue,

    // ── Canonical ──────────────────────────────────────────────────────────
    alternates: {
      canonical: canonicalUrl,
    },

    // ── Open Graph ────────────────────────────────────────────────────────
    openGraph: {
      type,
      siteName: SITE_META.SITE_NAME,
      title: fullTitle,
      description: safeDescription,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title ?? SITE_META.SITE_NAME,
        },
      ],
      // Article-specific OG fields
      ...(type === 'article' && publishedTime
        ? {
            publishedTime,
            authors: [SITE_META.AUTHOR_URL],
          }
        : {}),
    },

    // ── Twitter Cards ─────────────────────────────────────────────────────
    twitter: {
      card: 'summary_large_image',
      site: SITE_META.TWITTER_HANDLE,
      creator: SITE_META.TWITTER_HANDLE,
      title: fullTitle,
      description: safeDescription,
      images: [ogImage],
    },

    // ── Misc ──────────────────────────────────────────────────────────────
    metadataBase: new URL(SITE_META.SITE_URL),
  };
}

// ─── JSON-LD Schema Builders ──────────────────────────────────────────────────

export interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedTime: string;
  authorName?: string;
}

/**
 * Generates a JSON-LD `NewsArticle` schema object.
 * Inject as: <script type="application/ld+json">{JSON.stringify(buildArticleJsonLd(...))}</script>
 */
export function buildArticleJsonLd(props: ArticleJsonLdProps): object {
  const {
    title,
    description,
    url,
    imageUrl = SITE_META.DEFAULT_OG_IMAGE,
    publishedTime,
    authorName = SITE_META.AUTHOR_NAME,
  } = props;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    url,
    image: [imageUrl],
    datePublished: publishedTime,
    dateModified: publishedTime,
    author: {
      '@type': 'Person',
      name: authorName,
      url: SITE_META.AUTHOR_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_META.SITE_NAME,
      url: SITE_META.SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_META.SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    isAccessibleForFree: true,
  };
}

/**
 * Generates a JSON-LD `WebSite` schema with a `SearchAction` for sitelinks
 * search box eligibility.
 * Inject this in the root layout for the homepage.
 */
export function buildWebSiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_META.SITE_NAME,
    description: SITE_META.DEFAULT_DESCRIPTION,
    url: SITE_META.SITE_URL,
    author: {
      '@type': 'Person',
      name: SITE_META.AUTHOR_NAME,
      url: SITE_META.AUTHOR_URL,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_META.SITE_URL}/?filter={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates a JSON-LD `BreadcrumbList` schema for article pages.
 * Helps search engines understand the site hierarchy.
 */
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
