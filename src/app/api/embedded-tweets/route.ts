import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddedTweets, createEmbeddedTweet, updateEmbeddedTweet, deleteEmbeddedTweet } from '@/lib/db';

export async function GET(req: NextRequest) {
    const all = req.nextUrl.searchParams.get('all') === 'true';
    try {
        const tweets = await getEmbeddedTweets(all);
        return NextResponse.json(tweets);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const id = await createEmbeddedTweet(body);
        return NextResponse.json({ id });
    } catch {
        return NextResponse.json({ error: 'Failed to create tweet' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...data } = body;
        const ok = await updateEmbeddedTweet(id, data);
        return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = Number(req.nextUrl.searchParams.get('id'));
    try {
        const ok = await deleteEmbeddedTweet(id);
        return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
