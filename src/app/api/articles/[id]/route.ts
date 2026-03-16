import { NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id, 10);
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const article = await getArticleById(id);
        if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

        return NextResponse.json(article);
    } catch (error) {
        console.error('Failed to fetch article:', error);
        return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id, 10);
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const body = await request.json();
        const success = await updateArticle(id, body);

        if (!success) return NextResponse.json({ error: 'Article not found or no changes made' }, { status: 404 });

        revalidatePath('/');
        revalidatePath('/articles');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update article:', error);
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id, 10);
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const success = await deleteArticle(id);
        if (!success) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

        revalidatePath('/');
        revalidatePath('/articles');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete article:', error);
        return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }
}
