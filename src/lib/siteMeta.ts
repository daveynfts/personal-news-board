/**
 * siteMeta.ts — Global SEO Configuration
 * ─────────────────────────────────────────────────────
 * Single source of truth for all default SEO values.
 * Update SITE_URL when deploying to a custom domain.
 */

export const SITE_META = {
  /** Canonical production URL — no trailing slash */
  SITE_URL: 'https://personal-news-board.vercel.app',

  /** Site name used in og:site_name and title templates */
  SITE_NAME: 'Personal News Board',

  /** Falls back to this for pages without a custom title */
  DEFAULT_TITLE: 'Personal News Board | Elite Curation',

  /** Falls back to this for pages without a custom description */
  DEFAULT_DESCRIPTION:
    'A premium, personal collection of top news, insightful blogs, and curated X threads. Discover elite content curated by DaveyNFTs.',

  /** Default OG image — 1200×630 px, stored in /public */
  DEFAULT_OG_IMAGE: 'https://personal-news-board.vercel.app/og-default.png',

  /** Author / publisher info */
  AUTHOR_NAME: 'DaveyNFTs',
  AUTHOR_URL: 'https://x.com/DaveyNFTs_',

  /** Twitter / X handle for twitter:site and twitter:creator */
  TWITTER_HANDLE: '@DaveyNFTs_',

  /** Google-style title separator */
  TITLE_SEPARATOR: '|',
} as const;

/** Helper: build the canonical URL for a given path (must start with '/') */
export function buildCanonicalUrl(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_META.SITE_URL}${cleanPath}`;
}

/** Helper: build the full "<Page Title> | Site Name" string */
export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return SITE_META.DEFAULT_TITLE;
  return `${pageTitle} ${SITE_META.TITLE_SEPARATOR} ${SITE_META.SITE_NAME}`;
}
