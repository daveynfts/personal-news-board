import { NextRequest, NextResponse } from 'next/server';
import { getAllSiteSettings, setSiteSetting } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET — fetch all site settings
export async function GET() {
    try {
        const settings = await getAllSiteSettings();
        return NextResponse.json(settings);
    } catch (err) {
        console.error('Error fetching site settings:', err);
        return NextResponse.json({}, { status: 500 });
    }
}

// PUT — update a site setting
export async function PUT(req: NextRequest) {
    try {
        const { key, value } = await req.json();
        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }
        await setSiteSetting(key, value || '');
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error updating site setting:', err);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
