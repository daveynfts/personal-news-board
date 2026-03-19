import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Aggregate counts from all tables
        const [
            postsResult,
            articlesResult,
            eventsResult,
            exchangesResult,
            cryptoEventsResult,
            tweetsResult,
        ] = await Promise.all([
            db.execute('SELECT COUNT(*) as total FROM posts'),
            db.execute('SELECT COUNT(*) as total, SUM(CASE WHEN isEditorialPick = 1 THEN 1 ELSE 0 END) as editorialPicks FROM articles'),
            db.execute('SELECT COUNT(*) as total FROM events'),
            db.execute('SELECT COUNT(*) as total, SUM(CASE WHEN isVisible = 1 THEN 1 ELSE 0 END) as visible FROM exchanges'),
            db.execute('SELECT COUNT(*) as total, SUM(CASE WHEN isVisible = 1 THEN 1 ELSE 0 END) as visible, SUM(CASE WHEN status = \'live\' THEN 1 ELSE 0 END) as live, SUM(CASE WHEN status = \'upcoming\' THEN 1 ELSE 0 END) as upcoming FROM crypto_events'),
            db.execute('SELECT COUNT(*) as total, SUM(CASE WHEN isVisible = 1 THEN 1 ELSE 0 END) as visible FROM embedded_tweets'),
        ]);

        // Recent activity (last 7 items from each)
        const [recentPosts, recentArticles, recentEvents] = await Promise.all([
            db.execute('SELECT id, title, type, createdAt FROM posts ORDER BY createdAt DESC LIMIT 7'),
            db.execute('SELECT id, title, isEditorialPick, createdAt FROM articles ORDER BY createdAt DESC LIMIT 7'),
            db.execute('SELECT id, title, date, createdAt FROM events ORDER BY createdAt DESC LIMIT 7'),
        ]);

        // Content distribution by post type
        const postsByType = await db.execute('SELECT type, COUNT(*) as count FROM posts GROUP BY type ORDER BY count DESC');

        // Monthly content creation (last 6 months)
        const monthlyPosts = await db.execute(`
            SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count 
            FROM posts 
            WHERE createdAt >= datetime('now', '-6 months')
            GROUP BY month ORDER BY month ASC
        `);
        const monthlyArticles = await db.execute(`
            SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count 
            FROM articles 
            WHERE createdAt >= datetime('now', '-6 months')
            GROUP BY month ORDER BY month ASC
        `);

        const totalPosts = Number(postsResult.rows[0]?.total || 0);
        const totalArticles = Number(articlesResult.rows[0]?.total || 0);
        const editorialPicks = Number(articlesResult.rows[0]?.editorialPicks || 0);
        const totalEvents = Number(eventsResult.rows[0]?.total || 0);
        const totalExchanges = Number(exchangesResult.rows[0]?.total || 0);
        const visibleExchanges = Number(exchangesResult.rows[0]?.visible || 0);
        const totalCryptoEvents = Number(cryptoEventsResult.rows[0]?.total || 0);
        const liveCryptoEvents = Number(cryptoEventsResult.rows[0]?.live || 0);
        const upcomingCryptoEvents = Number(cryptoEventsResult.rows[0]?.upcoming || 0);
        const totalTweets = Number(tweetsResult.rows[0]?.total || 0);
        const visibleTweets = Number(tweetsResult.rows[0]?.visible || 0);

        const totalContent = totalPosts + totalArticles + totalEvents + totalTweets;

        return NextResponse.json({
            overview: {
                totalContent,
                totalPosts,
                totalArticles,
                editorialPicks,
                totalEvents,
                totalExchanges,
                visibleExchanges,
                totalCryptoEvents,
                liveCryptoEvents,
                upcomingCryptoEvents,
                totalTweets,
                visibleTweets,
            },
            postsByType: postsByType.rows.map(r => ({
                type: String(r.type),
                count: Number(r.count),
            })),
            monthlyActivity: {
                posts: monthlyPosts.rows.map(r => ({
                    month: String(r.month),
                    count: Number(r.count),
                })),
                articles: monthlyArticles.rows.map(r => ({
                    month: String(r.month),
                    count: Number(r.count),
                })),
            },
            recentActivity: [
                ...recentPosts.rows.map(r => ({
                    id: Number(r.id),
                    title: String(r.title),
                    category: 'post' as const,
                    label: String(r.type),
                    date: String(r.createdAt),
                })),
                ...recentArticles.rows.map(r => ({
                    id: Number(r.id),
                    title: String(r.title),
                    category: 'article' as const,
                    label: Number(r.isEditorialPick) === 1 ? 'Editorial Pick' : 'Article',
                    date: String(r.createdAt),
                })),
                ...recentEvents.rows.map(r => ({
                    id: Number(r.id),
                    title: String(r.title),
                    category: 'event' as const,
                    label: 'Event',
                    date: String(r.createdAt || r.date),
                })),
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
