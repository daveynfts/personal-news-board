import { NextResponse } from 'next/server';
import { getTweet } from 'react-tweet/api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

        const tweet = await getTweet(id);
        
        if (!tweet) {
            return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
        }
        
        return NextResponse.json(tweet);
    } catch (error) {
        console.error('API /api/tweet error:', error);
        return NextResponse.json({ error: 'Failed to fetch tweet' }, { status: 500 });
    }
}
