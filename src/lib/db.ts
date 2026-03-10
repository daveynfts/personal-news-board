import { createClient } from '@libsql/client';

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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
}

// Fire and forget initialization for simpler entry
initDb().catch(err => console.error('Database initialization failed:', err));

export interface Post {
    id?: number;
    type: string;
    title: string;
    url: string;
    imageUrl?: string;
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
        createdAt: String(row.createdAt || ''),
    }));
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<number> {
    const result = await db.execute({
        sql: 'INSERT INTO posts (type, title, url, imageUrl) VALUES (?, ?, ?, ?)',
        args: [post.type, post.title, post.url, post.imageUrl || '']
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
        createdAt: String(row.createdAt || ''),
    }));
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
        createdAt: String(row.createdAt || ''),
    };
}

export async function createArticle(article: Omit<Article, 'id' | 'createdAt'>): Promise<number> {
    const result = await db.execute({
        sql: 'INSERT INTO articles (title, content, coverImage, xSourceUrl, isEditorialPick) VALUES (?, ?, ?, ?, ?)',
        args: [article.title, article.content, article.coverImage || '', article.xSourceUrl || '', article.isEditorialPick ? 1 : 0]
    });
    return Number(result.lastInsertRowid || 0);
}

export async function updateArticle(id: number, article: Partial<Article>): Promise<boolean> {
    const setClauses: string[] = [];
    const args: any[] = [];

    if (article.title !== undefined) { setClauses.push('title = ?'); args.push(article.title); }
    if (article.content !== undefined) { setClauses.push('content = ?'); args.push(article.content); }
    if (article.coverImage !== undefined) { setClauses.push('coverImage = ?'); args.push(article.coverImage); }
    if (article.xSourceUrl !== undefined) { setClauses.push('xSourceUrl = ?'); args.push(article.xSourceUrl); }
    if (article.isEditorialPick !== undefined) { setClauses.push('isEditorialPick = ?'); args.push(article.isEditorialPick ? 1 : 0); }

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
