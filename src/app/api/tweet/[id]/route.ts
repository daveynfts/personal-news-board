import { NextResponse } from 'next/server';
import { getTweet } from 'react-tweet/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeTweetEntities(tweet: any) {
    if (!tweet) return;

    if (!tweet.entities) {
        tweet.entities = {};
    }

    const arrayKeys = ['hashtags', 'user_mentions', 'urls', 'symbols', 'media'];
    for (const key of arrayKeys) {
        if (!tweet.entities[key] || !Array.isArray(tweet.entities[key])) {
            tweet.entities[key] = [];
        }
    }

    if (tweet.quoted_tweet) {
        sanitizeTweetEntities(tweet.quoted_tweet);
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

        const tweet = await getTweet(id);
        
        if (!tweet) {
            return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
        }

        // Sanitize entities on the server to prevent client-side "r is not iterable" crash
        sanitizeTweetEntities(tweet);
        
        // Wrap as { data: tweet, ...tweet } to support both react-tweet client fetcher (needs .data)
        // and Sanity studio preview components (reads properties directly from root).
        return NextResponse.json({
            data: tweet,
            ...tweet
        });
    } catch (error) {
        console.error('API /api/tweet error:', error);
        return NextResponse.json({ error: 'Failed to fetch tweet' }, { status: 500 });
    }
}
