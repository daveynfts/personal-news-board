import { NextRequest, NextResponse } from 'next/server';
import { getAllCryptoEvents, getVisibleCryptoEvents, createCryptoEvent, updateCryptoEvent, deleteCryptoEvent } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';
        const events = all ? await getAllCryptoEvents() : await getVisibleCryptoEvents();
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching crypto events:', error);
        return NextResponse.json({ error: 'Failed to fetch crypto events' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const id = await createCryptoEvent({
            platform: body.platform,
            platformIcon: body.platformIcon || '🟡',
            platformColor: body.platformColor || '#f0b90b',
            eventType: body.eventType || 'Launchpool',
            tokenSymbol: body.tokenSymbol,
            tokenName: body.tokenName || '',
            description: body.description || '',
            status: body.status || 'upcoming',
            endDate: body.endDate || '',
            totalRewards: body.totalRewards || '',
            stakingAssets: body.stakingAssets || '[]',
            apr: body.apr || '',
            tags: body.tags || '[]',
            ctaLink: body.ctaLink || '#',
            sortOrder: body.sortOrder || 0,
            isVisible: body.isVisible !== false,
        });
        return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
        console.error('Error creating crypto event:', error);
        return NextResponse.json({ error: 'Failed to create crypto event' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const success = await updateCryptoEvent(id, data);
        if (success) return NextResponse.json({ success: true });
        return NextResponse.json({ error: 'Crypto event not found' }, { status: 404 });
    } catch (error) {
        console.error('Error updating crypto event:', error);
        return NextResponse.json({ error: 'Failed to update crypto event' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get('id'));
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const success = await deleteCryptoEvent(id);
        if (success) return NextResponse.json({ success: true });
        return NextResponse.json({ error: 'Crypto event not found' }, { status: 404 });
    } catch (error) {
        console.error('Error deleting crypto event:', error);
        return NextResponse.json({ error: 'Failed to delete crypto event' }, { status: 500 });
    }
}
