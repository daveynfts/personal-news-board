import { NextResponse } from 'next/server';
import { sanityClient } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const query = `*[_type == "cryptoEvent" && isVisible == true] | order(sortOrder asc) {
            "id": _id,
            platform,
            platformIcon,
            platformColor,
            "type": eventType,
            tokenName,
            tokenSymbol,
            description,
            totalRewards,
            stakingAssets,
            "estAPR": apr,
            "startDate": "",
            endDate,
            status,
            "link": ctaLink,
            tags
        }`;

        const events = await sanityClient.fetch(query);

        return NextResponse.json(events, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Failed to fetch crypto events:', error);
        return NextResponse.json([], { status: 500 });
    }
}
