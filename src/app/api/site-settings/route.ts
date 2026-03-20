import { NextResponse } from 'next/server';
import { getAllSiteSettings } from '@/lib/db';

export async function GET() {
    try {
        const settings = await getAllSiteSettings();
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({}, { status: 500 });
    }
}
