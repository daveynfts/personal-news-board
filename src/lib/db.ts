import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Connect to the SQLite database
const dbPath = path.join(dataDir, 'database.sqlite');
export const db = new Database(dbPath);

// Initialize the posts table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    imageUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Post {
    id?: number;
    type: 'News' | 'Blog' | 'X';
    title: string;
    url: string;
    imageUrl?: string;
    createdAt?: string;
}

export function getAllPosts(): Post[] {
    const stmt = db.prepare('SELECT * FROM posts ORDER BY createdAt DESC');
    return stmt.all() as Post[];
}

export function createPost(post: Omit<Post, 'id' | 'createdAt'>): number | bigint {
    const stmt = db.prepare('INSERT INTO posts (type, title, url, imageUrl) VALUES (@type, @title, @url, @imageUrl)');
    const info = stmt.run(post);
    return info.lastInsertRowid;
}

export function deletePost(id: number): boolean {
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
}
