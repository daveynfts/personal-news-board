import { NextResponse } from 'next/server';
import { getEmbeddedTweets } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tweets = await getEmbeddedTweets(); // Fetches visible tweets from Sanity
    return NextResponse.json(tweets);
  } catch (error) {
    console.error('Error fetching embedded tweets:', error);
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 });
  }
}
