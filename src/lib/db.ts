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
