import { NextResponse } from 'next/server';
import { getAllArticles, createArticle } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const articles = await getAllArticles();
        return NextResponse.json(articles);
    } catch (error) {
        console.error('Failed to fetch articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, coverImage, xSourceUrl, isEditorialPick } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const newId = await createArticle({
            title,
            content,
            coverImage,
            xSourceUrl,
            isEditorialPick: Boolean(isEditorialPick)
        });

        revalidatePath('/');
        return NextResponse.json({ id: newId }, { status: 201 });
    } catch (error) {
        console.error('Failed to create article:', error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}
