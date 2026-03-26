import { NextResponse } from 'next/server';
import { sanityClient } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const query = `*[_type == "footerSettings"][0] {
            brandDescription,
            socialXUrl,
            navLinks[] { label, href },
            resourceLinks[] { label, href, isExternal, hasSparkle },
            disclaimerTitle,
            disclaimerText,
            copyrightText
        }`;

        const settings = await sanityClient.fetch(query);

        if (!settings) {
            return NextResponse.json(null); // Frontend will use i18n defaults
        }

        return NextResponse.json(settings, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Failed to fetch footer settings:', error);
        return NextResponse.json(null, { status: 500 });
    }
}
