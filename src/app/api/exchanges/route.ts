import { NextResponse } from 'next/server';
import { sanityClient } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const query = `*[_type == "exchange" && isVisible == true] | order(sortOrder asc) {
            name,
            badge,
            badgeColor,
            bonus,
            gradient,
            "glowColor": coalesce(glowColor.hex, glowColor),
            "logo": logo.asset->url,
            "features": features[].text,
            link
        }`;

        const exchanges = await sanityClient.fetch(query);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = exchanges.map((ex: any) => ({
            ...ex,
            glowColor: ex.glowColor || 'rgba(255, 255, 255, 0.2)',
            features: JSON.stringify(ex.features || [])
        }));

        return NextResponse.json(mapped, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Failed to fetch exchanges:', error);
        return NextResponse.json({ error: 'Failed to fetch exchanges' }, { status: 500 });
    }
}
