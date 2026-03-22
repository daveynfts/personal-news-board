import { sanityClient } from '@/sanity/lib/client';
import { urlForImage, urlForOgImage } from '@/sanity/lib/image';

// Helper to Safely Generate Image URL
function getImageUrl(source: any): string {
  if (!source) return '';
  try {
    return urlForImage(source)?.url() || '';
  } catch (e) {
    return '';
  }
}

function getOgImageUrl(source: any): string {
  if (!source) return '';
  try {
    return urlForOgImage(source)?.url() || '';
  } catch (e) {
    return '';
  }
}

// Helper to Map Legacy Post Types
function mapPostType(type: string): string {
  if (!type) return 'Research';
  const lower = type.trim().toLowerCase();
  
  if (lower === 'news' || lower === 'research') return 'Research';
  if (lower === 'blog' || lower === 'article') return 'Article';
  
  // Title case fallback if it's something else
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// --- POSTS ---
export interface Post {
    id?: string | number;
    type: string;
    title: string;
    url: string;
    imageUrl?: string;
    isMore?: boolean;
    createdAt?: string;
}

export async function getAllPosts(): Promise<Post[]> {
    const query = `*[_type == "post"] | order(publishedAt desc)`;
    const posts = await sanityClient.fetch(query);
    return posts.map((p: any) => ({
        id: p._id,
        type: mapPostType(p.type),
        title: p.title,
        url: p.url,
        imageUrl: getImageUrl(p.imageUrl),
        isMore: p.isMore || false,
        createdAt: p.publishedAt,
    }));
}

export async function getMorePosts(): Promise<Post[]> {
    const query = `*[_type == "post" && isMore == true] | order(publishedAt desc)`;
    const posts = await sanityClient.fetch(query);
    return posts.map((p: any) => ({
        id: p._id,
        type: mapPostType(p.type),
        title: p.title,
        url: p.url,
        imageUrl: getImageUrl(p.imageUrl),
        isMore: true,
        createdAt: p.publishedAt,
    }));
}

export async function togglePostMore(id: string, isMore: boolean): Promise<boolean> {
    try {
        await sanityClient.patch(id).set({ isMore }).commit();
        return true;
    } catch { return false; }
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<string> {
    const result = await sanityClient.create({
        _type: 'post',
        ...post,
        publishedAt: new Date().toISOString()
    });
    return result._id;
}

export async function deletePost(id: string): Promise<boolean> {
    try { await sanityClient.delete(id); return true; } catch { return false; }
}

// --- ARTICLES ---

export interface Article {
    id?: string | number;
    title: string;
    content: any; // Updated to accept block content array from Sanity or string
    coverImage?: string;
    squareThumbnail?: string;
    category?: string;
    authorName?: string;
    daveysTake?: string;
    xSourceUrl?: string;
    isEditorialPick: boolean;
    isHotStory?: boolean;
    isMore?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // SEO
    seo?: any;
    slug?: string;
}

export async function getAllArticles(): Promise<Article[]> {
    const query = `*[_type == "article"] | order(publishedAt desc)`;
    const articles = await sanityClient.fetch(query);
    return articles.map((a: any) => ({
        id: a._id,
        title: a.title,
        content: a.content,
        coverImage: getImageUrl(a.coverImage),
        squareThumbnail: getImageUrl(a.squareThumbnail),
        category: a.category,
        authorName: a.authorName,
        daveysTake: a.daveysTake,
        xSourceUrl: a.xSourceUrl,
        isEditorialPick: a.isEditorialPick || false,
        isHotStory: a.isHotStory || false,
        isMore: a.isMore || false,
        createdAt: a.publishedAt,
        updatedAt: a._updatedAt,
        seo: a.seo ? {
            ...a.seo,
            openGraphImage: getOgImageUrl(a.seo.openGraphImage)
        } : undefined,
        slug: a.slug?.current
    }));
}

export async function getMoreArticles(): Promise<Article[]> {
    const query = `*[_type == "article" && isMore == true] | order(publishedAt desc)`;
    const articles = await sanityClient.fetch(query);
    return articles.map((a: any) => ({
        id: a._id,
        title: a.title,
        content: a.content,
        coverImage: getImageUrl(a.coverImage),
        squareThumbnail: getImageUrl(a.squareThumbnail),
        daveysTake: a.daveysTake,
        xSourceUrl: a.xSourceUrl,
        isEditorialPick: a.isEditorialPick || false,
        isMore: true,
        createdAt: a.publishedAt,
        updatedAt: a._updatedAt,
        seo: a.seo ? {
            ...a.seo,
            openGraphImage: getOgImageUrl(a.seo.openGraphImage)
        } : undefined,
        slug: a.slug?.current
    }));
}

export async function toggleArticleMore(id: string, isMore: boolean): Promise<boolean> {
    try { await sanityClient.patch(id).set({ isMore }).commit(); return true; } catch { return false; }
}

// Accept both numeric string (old sqlite) or sanity strict id for fallback
export async function getArticleById(id: string | number): Promise<Article | null> {
    const query = `*[_type == "article" && (_id == $id || slug.current == $id)] [0]`;
    const a = await sanityClient.fetch(query, { id: String(id) });
    if (!a) return null;
    return {
        id: a._id,
        title: a.title,
        content: a.content,
        coverImage: getImageUrl(a.coverImage),
        squareThumbnail: getImageUrl(a.squareThumbnail),
        daveysTake: a.daveysTake,
        xSourceUrl: a.xSourceUrl,
        isEditorialPick: a.isEditorialPick || false,
        isMore: a.isMore || false,
        createdAt: a.publishedAt,
        updatedAt: a._updatedAt,
        seo: a.seo ? {
            ...a.seo,
            openGraphImage: getOgImageUrl(a.seo.openGraphImage)
        } : undefined,
        slug: a.slug?.current
    };
}

export async function createArticle(article: Omit<Article, 'id' | 'createdAt'>): Promise<string> {
    const result = await sanityClient.create({
        _type: 'article',
        ...article,
        publishedAt: new Date().toISOString()
    });
    return result._id;
}

export async function updateArticle(id: string, article: Partial<Article>): Promise<boolean> {
    try { await sanityClient.patch(id).set(article as any).commit(); return true; } catch { return false; }
}

export async function getRelatedArticles(idToExclude: string | number, category?: string, limit: number = 3): Promise<Article[]> {
    let filter = `_type == "article" && _id != $id && slug.current != $id`;
    if (category) filter += ` && category == $category`;

    const query = `*[${filter}] | order(publishedAt desc) [0...${limit}]`;
    let articles = await sanityClient.fetch(query, { id: String(idToExclude), category: category || '' });

    // Fallback if not enough articles in the same category
    if (category && articles.length < limit) {
        const remaining = limit - articles.length;
        const exclusionIds = [String(idToExclude), ...articles.map((a: any) => a._id)];
        const genericQuery = `*[_type == "article" && !(_id in $exclusionIds)] | order(publishedAt desc) [0...${remaining}]`;
        const moreArticles = await sanityClient.fetch(genericQuery, { exclusionIds });
        articles = [...articles, ...moreArticles];
    }

    return articles.map((a: any) => ({
        id: a._id,
        title: a.title,
        content: a.content,
        coverImage: getImageUrl(a.coverImage),
        squareThumbnail: getImageUrl(a.squareThumbnail),
        category: a.category,
        authorName: a.authorName,
        daveysTake: a.daveysTake,
        xSourceUrl: a.xSourceUrl,
        isEditorialPick: a.isEditorialPick || false,
        isHotStory: a.isHotStory || false,
        isMore: a.isMore || false,
        createdAt: a.publishedAt,
        updatedAt: a._updatedAt,
        slug: a.slug?.current
    }));
}

export async function deleteArticle(id: string): Promise<boolean> {
    try { await sanityClient.delete(id); return true; } catch { return false; }
}

// --- EVENTS ---

export interface CalendarEvent {
    id?: string | number;
    title: string;
    description?: string;
    date: string;
    location?: string;
    link?: string;
    imageUrl?: string;
    timelineImageUrl?: string;
    isMore?: boolean;
    createdAt?: string;
}

export async function getAllEvents(): Promise<CalendarEvent[]> {
    const query = `*[_type == "event"] | order(date asc)`;
    const events = await sanityClient.fetch(query);
    return events.map((e: any) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        location: e.location,
        link: e.link,
        imageUrl: getImageUrl(e.imageUrl),
        timelineImageUrl: getImageUrl(e.timelineImageUrl),
        isMore: e.isMore || false,
        createdAt: e._createdAt,
    }));
}

export async function getMoreEvents(): Promise<CalendarEvent[]> {
    const query = `*[_type == "event" && isMore == true] | order(_createdAt desc)`;
    const events = await sanityClient.fetch(query);
    return events.map((e: any) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        location: e.location,
        link: e.link,
        imageUrl: getImageUrl(e.imageUrl),
        timelineImageUrl: getImageUrl(e.timelineImageUrl),
        isMore: true,
        createdAt: e._createdAt,
    }));
}

export async function toggleEventMore(id: string, isMore: boolean): Promise<boolean> {
    try { await sanityClient.patch(id).set({ isMore }).commit(); return true; } catch { return false; }
}

export async function createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<string> {
    const result = await sanityClient.create({ _type: 'event', ...event });
    return result._id;
}

export async function updateEvent(id: string, event: Partial<CalendarEvent>): Promise<boolean> {
    try { await sanityClient.patch(id).set(event as any).commit(); return true; } catch { return false; }
}

export async function deleteEvent(id: string): Promise<boolean> {
    try { await sanityClient.delete(id); return true; } catch { return false; }
}

// --- EXCHANGES (Special Offer page) ---

export interface Exchange {
    id?: string | number;
    name: string;
    badge: string;
    badgeColor: string;
    bonus: string;
    gradient: string;
    glowColor: string;
    logo: string;
    features: string | any[]; 
    link: string;
    sortOrder: number;
    isVisible: boolean;
    createdAt?: string;
}

export async function getAllExchanges(): Promise<Exchange[]> {
    const query = `*[_type == "exchange"] | order(sortOrder asc, _createdAt asc)`;
    const exchanges = await sanityClient.fetch(query);
    return exchanges.map((ex: any) => ({
        ...ex,
        id: ex._id,
        features: JSON.stringify(ex.features || []), // Mock old string format if ui parses it
        createdAt: ex._createdAt,
    }));
}

export async function getVisibleExchanges(): Promise<Exchange[]> {
    const query = `*[_type == "exchange" && isVisible == true] | order(sortOrder asc, _createdAt asc)`;
    const exchanges = await sanityClient.fetch(query);
    return exchanges.map((ex: any) => ({
        ...ex,
        id: ex._id,
        features: JSON.stringify(ex.features || []),
        createdAt: ex._createdAt,
    }));
}

export async function createExchange(ex: Omit<Exchange, 'id' | 'createdAt'>): Promise<string> {
    const result = await sanityClient.create({ _type: 'exchange', ...ex });
    return result._id;
}

export async function updateExchange(id: string, ex: Partial<Exchange>): Promise<boolean> {
    try { await sanityClient.patch(id).set(ex as any).commit(); return true; } catch { return false; }
}

export async function deleteExchange(id: string): Promise<boolean> {
    try { await sanityClient.delete(id); return true; } catch { return false; }
}

// --- CRYPTO EVENTS (Airdrop Radar) ---

export interface CryptoEvent {
    id?: string | number;
    platform: string;
    platformIcon: string;
    platformColor: string;
    eventType: string;
    tokenSymbol: string;
    tokenName: string;
    description: string;
    status: string;
    endDate: string;
    totalRewards: string;
    stakingAssets: string | any[];
    apr: string;
    tags: string | any[];
    ctaLink: string;
    sortOrder: number;
    isVisible: boolean;
    createdAt?: string;
}

export async function getAllCryptoEvents(): Promise<CryptoEvent[]> {
    const query = `*[_type == "cryptoEvent"] | order(sortOrder asc, _createdAt desc)`;
    const events = await sanityClient.fetch(query);
    return events.map((ev: any) => ({
        ...ev,
        id: ev._id,
        stakingAssets: JSON.stringify(ev.stakingAssets || []),
        tags: JSON.stringify(ev.tags || []),
        createdAt: ev._createdAt,
    }));
}

export async function getVisibleCryptoEvents(): Promise<CryptoEvent[]> {
    const query = `*[_type == "cryptoEvent" && isVisible == true] | order(sortOrder asc, _createdAt desc)`;
    const events = await sanityClient.fetch(query);
    return events.map((ev: any) => ({
        ...ev,
        id: ev._id,
        stakingAssets: JSON.stringify(ev.stakingAssets || []),
        tags: JSON.stringify(ev.tags || []),
        createdAt: ev._createdAt,
    }));
}

export async function createCryptoEvent(ev: Omit<CryptoEvent, 'id' | 'createdAt'>): Promise<string> {
    const result = await sanityClient.create({ _type: 'cryptoEvent', ...ev });
    return result._id;
}

export async function updateCryptoEvent(id: string, ev: Partial<CryptoEvent>): Promise<boolean> {
    try { await sanityClient.patch(id).set(ev as any).commit(); return true; } catch { return false; }
}

export async function deleteCryptoEvent(id: string): Promise<boolean> {
    try { await sanityClient.delete(id); return true; } catch { return false; }
}

// ── Embedded Tweets ──
export interface EmbeddedTweet {
    id?: string | number;
    tweetId: string;
    label?: string;
    category?: string;
    sortOrder?: number;
    isVisible?: boolean;
    createdAt?: string;
}

export async function getEmbeddedTweets(allIncludingHidden = false): Promise<EmbeddedTweet[]> {
    const query = allIncludingHidden 
        ? `*[_type == "embeddedTweet"] | order(sortOrder asc, _createdAt desc)`
        : `*[_type == "embeddedTweet" && (isVisible == true || !defined(isVisible))] | order(sortOrder asc, _createdAt desc)`;
    const tweets = await sanityClient.fetch(query);
    return tweets.map((t: any) => ({
        id: t._id,
        tweetId: t.tweetId,
        label: t.label || '',
        category: t.category || 'general',
        sortOrder: t.sortOrder || 0,
        isVisible: t.isVisible,
        createdAt: t._createdAt,
    }));
}

export async function createEmbeddedTweet(tweet: Omit<EmbeddedTweet, 'id' | 'createdAt'>): Promise<string> {
    const result = await sanityClient.create({ _type: 'embeddedTweet', ...tweet });
    return result._id;
}

export async function updateEmbeddedTweet(id: string, tweet: Partial<EmbeddedTweet>): Promise<boolean> {
    try { await sanityClient.patch(id).set(tweet as any).commit(); return true; } catch { return false; }
}

export async function deleteEmbeddedTweet(id: string): Promise<boolean> {
    try { await sanityClient.delete(id); return true; } catch { return false; }
}

// ── Site Settings ──
export async function getSiteSetting(key: string): Promise<string> {
    const query = `*[_type == "siteSettings"][0]`;
    const settings = await sanityClient.fetch(query);
    return settings ? settings[key] || '' : '';
}

export async function setSiteSetting(key: string, value: string): Promise<void> {
    try {
        await sanityClient.patch('siteSettings').set({ [key]: value }).commit();
    } catch {
        await sanityClient.createIfNotExists({ _id: 'siteSettings', _type: 'siteSettings', [key]: value });
    }
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
     const query = `*[_type == "siteSettings"][0]`;
     const settings = await sanityClient.fetch(query);
     if (!settings) return {};
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
     const { _id, _type, _rev, _updatedAt, _createdAt, avatar, ...rest } = settings;
     return {
         ...rest,
         avatarUrl: getImageUrl(settings.avatar)
     };
}
