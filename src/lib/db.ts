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
