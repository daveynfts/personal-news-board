import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export interface SearchResult {
    id: number;
    title: string;
    type: 'post' | 'article' | 'event' | 'offer';
    subType?: string; // 'News' | 'Blog' | 'X' for posts, 'Editorial' | 'Feature' for articles
    url?: string;
    imageUrl?: string;
    date?: string;
    snippet?: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim();
        const scope = searchParams.get('scope') || 'all'; // 'all' | 'posts' | 'articles' | 'events' | 'offers'
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [], total: 0 });
        }

        // Escape special SQL LIKE characters
        const safeTerm = `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
        const results: SearchResult[] = [];

        // Search Posts
        if (scope === 'all' || scope === 'posts') {
            const posts = await db.execute({
                sql: `SELECT id, type, title, url, imageUrl, createdAt 
                      FROM posts 
                      WHERE title LIKE ? ESCAPE '\\' 
                      ORDER BY createdAt DESC 
                      LIMIT ?`,
                args: [safeTerm, limit],
            });

            for (const row of posts.rows) {
                results.push({
                    id: Number(row.id),
                    title: String(row.title),
                    type: 'post',
                    subType: String(row.type),
                    url: String(row.url || ''),
                    imageUrl: String(row.imageUrl || ''),
                    date: String(row.createdAt || ''),
                });
            }
        }

        // Search Articles (title + content)
        if (scope === 'all' || scope === 'articles') {
            const articles = await db.execute({
                sql: `SELECT id, title, content, coverImage, isEditorialPick, createdAt 
                      FROM articles 
                      WHERE title LIKE ? ESCAPE '\\' OR content LIKE ? ESCAPE '\\'
                      ORDER BY createdAt DESC 
                      LIMIT ?`,
                args: [safeTerm, safeTerm, limit],
            });

            for (const row of articles.rows) {
                // Extract a snippet from content around the match
                const content = String(row.content || '');
                const lowerContent = content.toLowerCase();
                const lowerQuery = query.toLowerCase();
                const matchIndex = lowerContent.indexOf(lowerQuery);

                let snippet = '';
                if (matchIndex >= 0) {
                    const start = Math.max(0, matchIndex - 40);
                    const end = Math.min(content.length, matchIndex + query.length + 80);
                    snippet = (start > 0 ? '...' : '') +
                        content.slice(start, end).replace(/\n+/g, ' ').trim() +
                        (end < content.length ? '...' : '');
                } else {
                    snippet = content.replace(/\n+/g, ' ').trim().slice(0, 120) + (content.length > 120 ? '...' : '');
                }

                results.push({
                    id: Number(row.id),
                    title: String(row.title),
                    type: 'article',
                    subType: Number(row.isEditorialPick) === 1 ? 'Editorial Pick' : 'Feature',
                    imageUrl: String(row.coverImage || ''),
                    date: String(row.createdAt || ''),
                    snippet,
                });
            }
        }

        // Search Events (title + description + location)
        if (scope === 'all' || scope === 'events') {
            const events = await db.execute({
                sql: `SELECT id, title, description, date, location, imageUrl, createdAt 
                      FROM events 
                      WHERE title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' OR location LIKE ? ESCAPE '\\'
                      ORDER BY date DESC 
                      LIMIT ?`,
                args: [safeTerm, safeTerm, safeTerm, limit],
            });

            for (const row of events.rows) {
                results.push({
                    id: Number(row.id),
                    title: String(row.title),
                    type: 'event',
                    url: '',
                    imageUrl: String(row.imageUrl || ''),
                    date: String(row.date || ''),
                    snippet: String(row.location || ''),
                });
            }
        }

        // Search Exchanges (Special Offers)
        if (scope === 'all' || scope === 'offers') {
            const exchanges = await db.execute({
                sql: `SELECT id, name, badge, bonus, features, link, createdAt 
                      FROM exchanges 
                      WHERE isVisible = 1 AND (name LIKE ? ESCAPE '\\' OR bonus LIKE ? ESCAPE '\\' OR features LIKE ? ESCAPE '\\')
                      ORDER BY sortOrder ASC 
                      LIMIT ?`,
                args: [safeTerm, safeTerm, safeTerm, limit],
            });

            for (const row of exchanges.rows) {
                results.push({
                    id: Number(row.id),
                    title: String(row.name),
                    type: 'offer',
                    subType: String(row.badge || 'Offer'),
                    url: String(row.link || '/special-offer'),
                    date: String(row.createdAt || ''),
                    snippet: String(row.bonus || ''),
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
