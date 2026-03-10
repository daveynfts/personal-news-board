import { NextResponse } from 'next/server';
import { getAllPosts, createPost, deletePost, db } from '@/lib/db';

export async function GET() {
    try {
        const posts = getAllPosts();
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, title, url, imageUrl } = body;

        if (!type || !title || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newId = createPost({ type, title, url, imageUrl });
        return NextResponse.json({ id: newId, success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
        }

        const success = deletePost(parseInt(id, 10));
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, type, title, url, imageUrl } = body;

        if (!id || !type || !title || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare('UPDATE posts SET type = ?, title = ?, url = ?, imageUrl = ? WHERE id = ?');
        const info = stmt.run(type, title, url, imageUrl, id);

        if (info.changes > 0) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}
