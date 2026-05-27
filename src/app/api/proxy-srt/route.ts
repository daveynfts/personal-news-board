import { NextResponse } from 'next/server';

// Allowlist of trusted domains for SRT proxy
const ALLOWED_HOSTS = ['cdn.sanity.io'];

function isAllowedUrl(urlStr: string): boolean {
    try {
        const parsed = new URL(urlStr);
        // Only allow HTTPS
        if (parsed.protocol !== 'https:') return false;
        // Check against allowlist
        return ALLOWED_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
    } catch {
        return false;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    if (!isAllowedUrl(url)) {
        return new NextResponse('URL not allowed — only trusted CDN domains are permitted', { status: 403 });
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
