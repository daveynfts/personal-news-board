import { createClient, type InValue } from '@libsql/client';

// Connect to the Turso database
// In Vercel, these must be set in Environment Variables
const url = process.env.TURSO_DATABASE_URL || 'file:data/database.sqlite';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
    url,
    authToken,
});

// Initialize the posts table
async function initDb() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        imageUrl TEXT,
        isMore BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        coverImage TEXT,
        xSourceUrl TEXT,
        isEditorialPick BOOLEAN DEFAULT 0,
        isMore BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        location TEXT,
        link TEXT,
        imageUrl TEXT,
        timelineImageUrl TEXT,
        isMore BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS exchanges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        badge TEXT,
        badgeColor TEXT DEFAULT '#f0b90b',
        bonus TEXT,
        gradient TEXT,
        glowColor TEXT,
        logo TEXT DEFAULT '🟡',
        features TEXT DEFAULT '[]',
        link TEXT DEFAULT '#',
        sortOrder INTEGER DEFAULT 0,
        isVisible BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS crypto_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        platformIcon TEXT DEFAULT '🟡',
        platformColor TEXT DEFAULT '#f0b90b',
        eventType TEXT DEFAULT 'Launchpool',
        tokenSymbol TEXT NOT NULL,
        tokenName TEXT,
        description TEXT,
        status TEXT DEFAULT 'upcoming',
        endDate TEXT,
        totalRewards TEXT,
        stakingAssets TEXT DEFAULT '[]',
        apr TEXT,
        tags TEXT DEFAULT '[]',
        ctaLink TEXT DEFAULT '#',
        sortOrder INTEGER DEFAULT 0,
        isVisible BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrations for existing databases
    const migrations = [
        'ALTER TABLE events ADD COLUMN timelineImageUrl TEXT',
        'ALTER TABLE posts ADD COLUMN isMore BOOLEAN DEFAULT 0',
        'ALTER TABLE articles ADD COLUMN isMore BOOLEAN DEFAULT 0',
        'ALTER TABLE events ADD COLUMN isMore BOOLEAN DEFAULT 0',
    ];
    for (const sql of migrations) {
        try { await db.execute(sql); } catch { /* Ignore if column already exists */ }
    }
}

// Fire and forget initialization for simpler entry
initDb().catch(err => console.error('Database initialization failed:', err));

export interface Post {
    id?: number;
    type: string;
    title: string;
    url: string;
    imageUrl?: string;
    isMore?: boolean;
    createdAt?: string;
}

export async function getAllPosts(): Promise<Post[]> {
    const result = await db.execute('SELECT * FROM posts ORDER BY createdAt DESC');
    return result.rows.map(row => ({
        id: Number(row.id),
        type: String(row.type),
        title: String(row.title),
        url: String(row.url),
        imageUrl: String(row.imageUrl || ''),
        isMore: Number(row.isMore) === 1,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function getMorePosts(): Promise<Post[]> {
    const result = await db.execute('SELECT * FROM posts WHERE isMore = 1 ORDER BY createdAt DESC');
    return result.rows.map(row => ({
        id: Number(row.id),
        type: String(row.type),
        title: String(row.title),
        url: String(row.url),
        imageUrl: String(row.imageUrl || ''),
        isMore: true,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function togglePostMore(id: number, isMore: boolean): Promise<boolean> {
    const result = await db.execute({
        sql: 'UPDATE posts SET isMore = ? WHERE id = ?',
        args: [isMore ? 1 : 0, id]
    });
    return result.rowsAffected > 0;
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<number> {
    const result = await db.execute({
        sql: 'INSERT INTO posts (type, title, url, imageUrl, isMore) VALUES (?, ?, ?, ?, ?)',
        args: [post.type, post.title, post.url, post.imageUrl || '', post.isMore ? 1 : 0]
    });
    return Number(result.lastInsertRowid || 0);
}

export async function deletePost(id: number): Promise<boolean> {
    const result = await db.execute({
        sql: 'DELETE FROM posts WHERE id = ?',
        args: [id]
    });
    return result.rowsAffected > 0;
}

// --- ARTICLES ---

export interface Article {
    id?: number;
    title: string;
    content: string;
    coverImage?: string;
    xSourceUrl?: string;
    isEditorialPick: boolean;
    isMore?: boolean;
    createdAt?: string;
}

export async function getAllArticles(): Promise<Article[]> {
    const result = await db.execute('SELECT * FROM articles ORDER BY createdAt DESC');
    return result.rows.map(row => ({
        id: Number(row.id),
        title: String(row.title),
        content: String(row.content),
        coverImage: String(row.coverImage || ''),
        xSourceUrl: String(row.xSourceUrl || ''),
        isEditorialPick: Number(row.isEditorialPick) === 1,
        isMore: Number(row.isMore) === 1,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function getMoreArticles(): Promise<Article[]> {
    const result = await db.execute('SELECT * FROM articles WHERE isMore = 1 ORDER BY createdAt DESC');
    return result.rows.map(row => ({
        id: Number(row.id),
        title: String(row.title),
        content: String(row.content),
        coverImage: String(row.coverImage || ''),
        xSourceUrl: String(row.xSourceUrl || ''),
        isEditorialPick: Number(row.isEditorialPick) === 1,
        isMore: true,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function toggleArticleMore(id: number, isMore: boolean): Promise<boolean> {
    const result = await db.execute({
        sql: 'UPDATE articles SET isMore = ? WHERE id = ?',
        args: [isMore ? 1 : 0, id]
    });
    return result.rowsAffected > 0;
}

export async function getArticleById(id: number): Promise<Article | null> {
    const result = await db.execute({
        sql: 'SELECT * FROM articles WHERE id = ?',
        args: [id]
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
        id: Number(row.id),
        title: String(row.title),
        content: String(row.content),
        coverImage: String(row.coverImage || ''),
        xSourceUrl: String(row.xSourceUrl || ''),
        isEditorialPick: Number(row.isEditorialPick) === 1,
        isMore: Number(row.isMore) === 1,
        createdAt: String(row.createdAt || ''),
    };
}

export async function createArticle(article: Omit<Article, 'id' | 'createdAt'>): Promise<number> {
    const result = await db.execute({
        sql: 'INSERT INTO articles (title, content, coverImage, xSourceUrl, isEditorialPick, isMore) VALUES (?, ?, ?, ?, ?, ?)',
        args: [article.title, article.content, article.coverImage || '', article.xSourceUrl || '', article.isEditorialPick ? 1 : 0, article.isMore ? 1 : 0]
    });
    return Number(result.lastInsertRowid || 0);
}

export async function updateArticle(id: number, article: Partial<Article>): Promise<boolean> {
    const setClauses: string[] = [];
    const args: InValue[] = [];

    if (article.title !== undefined) { setClauses.push('title = ?'); args.push(article.title); }
    if (article.content !== undefined) { setClauses.push('content = ?'); args.push(article.content); }
    if (article.coverImage !== undefined) { setClauses.push('coverImage = ?'); args.push(article.coverImage); }
    if (article.xSourceUrl !== undefined) { setClauses.push('xSourceUrl = ?'); args.push(article.xSourceUrl); }
    if (article.isEditorialPick !== undefined) { setClauses.push('isEditorialPick = ?'); args.push(article.isEditorialPick ? 1 : 0); }
    if (article.isMore !== undefined) { setClauses.push('isMore = ?'); args.push(article.isMore ? 1 : 0); }

    if (setClauses.length === 0) return false;

    args.push(id);
    const sql = `UPDATE articles SET ${setClauses.join(', ')} WHERE id = ?`;

    const result = await db.execute({ sql, args });
    return result.rowsAffected > 0;
}

export async function deleteArticle(id: number): Promise<boolean> {
    const result = await db.execute({
        sql: 'DELETE FROM articles WHERE id = ?',
        args: [id]
    });
    return result.rowsAffected > 0;
}

// --- EVENTS ---

export interface CalendarEvent {
    id?: number;
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
    const result = await db.execute('SELECT * FROM events ORDER BY date ASC');
    return result.rows.map(row => ({
        id: Number(row.id),
        title: String(row.title),
        description: String(row.description || ''),
        date: String(row.date),
        location: String(row.location || ''),
        link: String(row.link || ''),
        imageUrl: String(row.imageUrl || ''),
        timelineImageUrl: String(row.timelineImageUrl || ''),
        isMore: Number(row.isMore) === 1,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function getMoreEvents(): Promise<CalendarEvent[]> {
    const result = await db.execute('SELECT * FROM events WHERE isMore = 1 ORDER BY createdAt DESC');
    return result.rows.map(row => ({
        id: Number(row.id),
        title: String(row.title),
        description: String(row.description || ''),
        date: String(row.date),
        location: String(row.location || ''),
        link: String(row.link || ''),
        imageUrl: String(row.imageUrl || ''),
        timelineImageUrl: String(row.timelineImageUrl || ''),
        isMore: true,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function toggleEventMore(id: number, isMore: boolean): Promise<boolean> {
    const result = await db.execute({
        sql: 'UPDATE events SET isMore = ? WHERE id = ?',
        args: [isMore ? 1 : 0, id]
    });
    return result.rowsAffected > 0;
}

export async function createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<number> {
    const result = await db.execute({
        sql: 'INSERT INTO events (title, description, date, location, link, imageUrl, timelineImageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [event.title, event.description || '', event.date, event.location || '', event.link || '', event.imageUrl || '', event.timelineImageUrl || '']
    });
    return Number(result.lastInsertRowid || 0);
}

export async function updateEvent(id: number, event: Partial<CalendarEvent>): Promise<boolean> {
    const setClauses: string[] = [];
    const args: InValue[] = [];

    if (event.title !== undefined) { setClauses.push('title = ?'); args.push(event.title); }
    if (event.description !== undefined) { setClauses.push('description = ?'); args.push(event.description); }
    if (event.date !== undefined) { setClauses.push('date = ?'); args.push(event.date); }
    if (event.location !== undefined) { setClauses.push('location = ?'); args.push(event.location); }
    if (event.link !== undefined) { setClauses.push('link = ?'); args.push(event.link); }
    if (event.imageUrl !== undefined) { setClauses.push('imageUrl = ?'); args.push(event.imageUrl); }
    if (event.timelineImageUrl !== undefined) { setClauses.push('timelineImageUrl = ?'); args.push(event.timelineImageUrl); }
    if (event.isMore !== undefined) { setClauses.push('isMore = ?'); args.push(event.isMore ? 1 : 0); }

    if (setClauses.length === 0) return false;

    args.push(id);
    const sql = `UPDATE events SET ${setClauses.join(', ')} WHERE id = ?`;

    const result = await db.execute({ sql, args });
    return result.rowsAffected > 0;
}

export async function deleteEvent(id: number): Promise<boolean> {
    const result = await db.execute({
        sql: 'DELETE FROM events WHERE id = ?',
        args: [id]
    });
    return result.rowsAffected > 0;
}

// --- EXCHANGES (Special Offer page) ---

export interface Exchange {
    id?: number;
    name: string;
    badge: string;
    badgeColor: string;
    bonus: string;
    gradient: string;
    glowColor: string;
    logo: string;
    features: string; // JSON array string
    link: string;
    sortOrder: number;
    isVisible: boolean;
    createdAt?: string;
}

export async function getAllExchanges(): Promise<Exchange[]> {
    const result = await db.execute('SELECT * FROM exchanges ORDER BY sortOrder ASC, createdAt ASC');
    return result.rows.map(row => ({
        id: Number(row.id),
        name: String(row.name),
        badge: String(row.badge || ''),
        badgeColor: String(row.badgeColor || '#f0b90b'),
        bonus: String(row.bonus || ''),
        gradient: String(row.gradient || ''),
        glowColor: String(row.glowColor || ''),
        logo: String(row.logo || '🟡'),
        features: String(row.features || '[]'),
        link: String(row.link || '#'),
        sortOrder: Number(row.sortOrder || 0),
        isVisible: Number(row.isVisible) !== 0,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function getVisibleExchanges(): Promise<Exchange[]> {
    const result = await db.execute('SELECT * FROM exchanges WHERE isVisible = 1 ORDER BY sortOrder ASC, createdAt ASC');
    return result.rows.map(row => ({
        id: Number(row.id),
        name: String(row.name),
        badge: String(row.badge || ''),
        badgeColor: String(row.badgeColor || '#f0b90b'),
        bonus: String(row.bonus || ''),
        gradient: String(row.gradient || ''),
        glowColor: String(row.glowColor || ''),
        logo: String(row.logo || '🟡'),
        features: String(row.features || '[]'),
        link: String(row.link || '#'),
        sortOrder: Number(row.sortOrder || 0),
        isVisible: true,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function createExchange(ex: Omit<Exchange, 'id' | 'createdAt'>): Promise<number> {
    const result = await db.execute({
        sql: 'INSERT INTO exchanges (name, badge, badgeColor, bonus, gradient, glowColor, logo, features, link, sortOrder, isVisible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [ex.name, ex.badge, ex.badgeColor, ex.bonus, ex.gradient, ex.glowColor, ex.logo, ex.features, ex.link, ex.sortOrder, ex.isVisible ? 1 : 0]
    });
    return Number(result.lastInsertRowid || 0);
}

export async function updateExchange(id: number, ex: Partial<Exchange>): Promise<boolean> {
    const setClauses: string[] = [];
    const args: InValue[] = [];
    if (ex.name !== undefined) { setClauses.push('name = ?'); args.push(ex.name); }
    if (ex.badge !== undefined) { setClauses.push('badge = ?'); args.push(ex.badge); }
    if (ex.badgeColor !== undefined) { setClauses.push('badgeColor = ?'); args.push(ex.badgeColor); }
    if (ex.bonus !== undefined) { setClauses.push('bonus = ?'); args.push(ex.bonus); }
    if (ex.gradient !== undefined) { setClauses.push('gradient = ?'); args.push(ex.gradient); }
    if (ex.glowColor !== undefined) { setClauses.push('glowColor = ?'); args.push(ex.glowColor); }
    if (ex.logo !== undefined) { setClauses.push('logo = ?'); args.push(ex.logo); }
    if (ex.features !== undefined) { setClauses.push('features = ?'); args.push(ex.features); }
    if (ex.link !== undefined) { setClauses.push('link = ?'); args.push(ex.link); }
    if (ex.sortOrder !== undefined) { setClauses.push('sortOrder = ?'); args.push(ex.sortOrder); }
    if (ex.isVisible !== undefined) { setClauses.push('isVisible = ?'); args.push(ex.isVisible ? 1 : 0); }
    if (setClauses.length === 0) return false;
    args.push(id);
    const result = await db.execute({ sql: `UPDATE exchanges SET ${setClauses.join(', ')} WHERE id = ?`, args });
    return result.rowsAffected > 0;
}

export async function deleteExchange(id: number): Promise<boolean> {
    const result = await db.execute({ sql: 'DELETE FROM exchanges WHERE id = ?', args: [id] });
    return result.rowsAffected > 0;
}

// --- CRYPTO EVENTS (Airdrop Radar) ---

export interface CryptoEvent {
    id?: number;
    platform: string;
    platformIcon: string;
    platformColor: string;
    eventType: string;
    tokenSymbol: string;
    tokenName: string;
    description: string;
    status: string; // 'live' | 'upcoming' | 'ended'
    endDate: string;
    totalRewards: string;
    stakingAssets: string; // JSON array string
    apr: string;
    tags: string; // JSON array string
    ctaLink: string;
    sortOrder: number;
    isVisible: boolean;
    createdAt?: string;
}

export async function getAllCryptoEvents(): Promise<CryptoEvent[]> {
    const result = await db.execute('SELECT * FROM crypto_events ORDER BY sortOrder ASC, createdAt DESC');
    return result.rows.map(row => ({
        id: Number(row.id),
        platform: String(row.platform || ''),
        platformIcon: String(row.platformIcon || '🟡'),
        platformColor: String(row.platformColor || '#f0b90b'),
        eventType: String(row.eventType || 'Launchpool'),
        tokenSymbol: String(row.tokenSymbol || ''),
        tokenName: String(row.tokenName || ''),
        description: String(row.description || ''),
        status: String(row.status || 'upcoming'),
        endDate: String(row.endDate || ''),
        totalRewards: String(row.totalRewards || ''),
        stakingAssets: String(row.stakingAssets || '[]'),
        apr: String(row.apr || ''),
        tags: String(row.tags || '[]'),
        ctaLink: String(row.ctaLink || '#'),
        sortOrder: Number(row.sortOrder || 0),
        isVisible: Number(row.isVisible) !== 0,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function getVisibleCryptoEvents(): Promise<CryptoEvent[]> {
    const result = await db.execute('SELECT * FROM crypto_events WHERE isVisible = 1 ORDER BY sortOrder ASC, createdAt DESC');
    return result.rows.map(row => ({
        id: Number(row.id),
        platform: String(row.platform || ''),
        platformIcon: String(row.platformIcon || '🟡'),
        platformColor: String(row.platformColor || '#f0b90b'),
        eventType: String(row.eventType || 'Launchpool'),
        tokenSymbol: String(row.tokenSymbol || ''),
        tokenName: String(row.tokenName || ''),
        description: String(row.description || ''),
        status: String(row.status || 'upcoming'),
        endDate: String(row.endDate || ''),
        totalRewards: String(row.totalRewards || ''),
        stakingAssets: String(row.stakingAssets || '[]'),
        apr: String(row.apr || ''),
        tags: String(row.tags || '[]'),
        ctaLink: String(row.ctaLink || '#'),
        sortOrder: Number(row.sortOrder || 0),
        isVisible: true,
        createdAt: String(row.createdAt || ''),
    }));
}

export async function createCryptoEvent(ev: Omit<CryptoEvent, 'id' | 'createdAt'>): Promise<number> {
    const result = await db.execute({
        sql: 'INSERT INTO crypto_events (platform, platformIcon, platformColor, eventType, tokenSymbol, tokenName, description, status, endDate, totalRewards, stakingAssets, apr, tags, ctaLink, sortOrder, isVisible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [ev.platform, ev.platformIcon, ev.platformColor, ev.eventType, ev.tokenSymbol, ev.tokenName, ev.description, ev.status, ev.endDate, ev.totalRewards, ev.stakingAssets, ev.apr, ev.tags, ev.ctaLink, ev.sortOrder, ev.isVisible ? 1 : 0]
    });
    return Number(result.lastInsertRowid || 0);
}

export async function updateCryptoEvent(id: number, ev: Partial<CryptoEvent>): Promise<boolean> {
    const setClauses: string[] = [];
    const args: InValue[] = [];
    if (ev.platform !== undefined) { setClauses.push('platform = ?'); args.push(ev.platform); }
    if (ev.platformIcon !== undefined) { setClauses.push('platformIcon = ?'); args.push(ev.platformIcon); }
    if (ev.platformColor !== undefined) { setClauses.push('platformColor = ?'); args.push(ev.platformColor); }
    if (ev.eventType !== undefined) { setClauses.push('eventType = ?'); args.push(ev.eventType); }
    if (ev.tokenSymbol !== undefined) { setClauses.push('tokenSymbol = ?'); args.push(ev.tokenSymbol); }
    if (ev.tokenName !== undefined) { setClauses.push('tokenName = ?'); args.push(ev.tokenName); }
    if (ev.description !== undefined) { setClauses.push('description = ?'); args.push(ev.description); }
    if (ev.status !== undefined) { setClauses.push('status = ?'); args.push(ev.status); }
    if (ev.endDate !== undefined) { setClauses.push('endDate = ?'); args.push(ev.endDate); }
    if (ev.totalRewards !== undefined) { setClauses.push('totalRewards = ?'); args.push(ev.totalRewards); }
    if (ev.stakingAssets !== undefined) { setClauses.push('stakingAssets = ?'); args.push(ev.stakingAssets); }
    if (ev.apr !== undefined) { setClauses.push('apr = ?'); args.push(ev.apr); }
    if (ev.tags !== undefined) { setClauses.push('tags = ?'); args.push(ev.tags); }
    if (ev.ctaLink !== undefined) { setClauses.push('ctaLink = ?'); args.push(ev.ctaLink); }
    if (ev.sortOrder !== undefined) { setClauses.push('sortOrder = ?'); args.push(ev.sortOrder); }
    if (ev.isVisible !== undefined) { setClauses.push('isVisible = ?'); args.push(ev.isVisible ? 1 : 0); }
    if (setClauses.length === 0) return false;
    args.push(id);
    const result = await db.execute({ sql: `UPDATE crypto_events SET ${setClauses.join(', ')} WHERE id = ?`, args });
    return result.rowsAffected > 0;
}

export async function deleteCryptoEvent(id: number): Promise<boolean> {
    const result = await db.execute({ sql: 'DELETE FROM crypto_events WHERE id = ?', args: [id] });
    return result.rowsAffected > 0;
}
