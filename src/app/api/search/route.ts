import { NextResponse } from 'next/server';
import { sanityClient } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';

export const dynamic = 'force-dynamic';

export interface SearchResult {
    id: string;
    title: string;
    type: 'post' | 'article' | 'event' | 'offer';
    subType?: string;
    url?: string;
    imageUrl?: string;
    date?: string;
    snippet?: string;
}

function getImageUrl(source: any): string {
  if (!source) return '';
  try { return urlForImage(source)?.url() || ''; } catch { return ''; }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim();
        const scope = searchParams.get('scope') || 'all'; 
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [], total: 0 });
        }

        const safeQuery = query + "*"; // wildcard match
        const results: SearchResult[] = [];

        // Search Posts
        if (scope === 'all' || scope === 'posts') {
            const posts = await sanityClient.fetch(
                `*[_type == "post" && title match $q] | order(publishedAt desc) [0...$limit]`,
                { q: safeQuery, limit }
            );

            for (const p of posts) {
                results.push({
                    id: p._id,
                    title: p.title,
                    type: 'post',
                    subType: p.type || 'news',
                    url: p.url || '',
                    imageUrl: getImageUrl(p.imageUrl),
                    date: p.publishedAt,
                });
            }
        }

        // Search Articles 
        if (scope === 'all' || scope === 'articles') {
            const articles = await sanityClient.fetch(
                `*[_type == "article" && (title match $q || pt::text(content) match $q)] | order(publishedAt desc) [0...$limit]`,
                { q: safeQuery, limit }
            );

            for (const a of articles) {
                results.push({
                    id: String(a.slug?.current || a._id),
                    title: a.title,
                    type: 'article',
                    subType: a.isEditorialPick ? 'Editorial Pick' : 'Feature',
                    imageUrl: getImageUrl(a.coverImage),
                    date: a.publishedAt,
                    snippet: '', // Simplified snippet for Sanity Search
                });
            }
        }

        // Search Events
        if (scope === 'all' || scope === 'events') {
            const events = await sanityClient.fetch(
                `*[_type == "event" && (title match $q || description match $q || location match $q)] | order(date desc) [0...$limit]`,
                { q: safeQuery, limit }
            );

            for (const e of events) {
                results.push({
                    id: e._id,
                    title: e.title,
                    type: 'event',
                    url: e.link || '',
                    imageUrl: getImageUrl(e.imageUrl),
                    date: e.date,
                    snippet: e.location || '',
                });
            }
        }

        // Search Exchanges
        if (scope === 'all' || scope === 'offers') {
            const exchanges = await sanityClient.fetch(
                `*[_type == "exchange" && isVisible == true && (name match $q || bonus match $q || $raw match features[])] | order(sortOrder asc) [0...$limit]`,
                { q: safeQuery, raw: query, limit }
            );

            for (const ex of exchanges) {
                results.push({
                    id: ex._id,
                    title: ex.name,
                    type: 'offer',
                    subType: ex.badge || 'Offer',
                    url: ex.link || '/special-offer',
                    date: ex._createdAt,
                    snippet: ex.bonus || '',
                });
            }
        }

        // Sort all results: most recent first
        results.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });

        return NextResponse.json({
            results: results.slice(0, limit),
            total: results.length,
            query,
        });
    } catch (error) {
        console.error('Search failed:', error);
        return NextResponse.json({ results: [], total: 0, error: 'Search failed' }, { status: 500 });
    }
}
