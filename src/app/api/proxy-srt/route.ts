import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        const res = await fetch(url);
        if (!res.ok) {
            return new NextResponse(`Failed to fetch from remote: ${res.statusText}`, { status: res.status });
        }
        const text = await res.text();
        return new NextResponse(text, { 
            headers: { 
                'Content-Type': 'text/plain',
            } 
        });
    } catch (error) {
        console.error("Proxy SRT Error:", error);
        return new NextResponse('Internal Server Error fetching SRT', { status: 500 });
    }
}
