import { NextRequest, NextResponse } from 'next/server';
import { getAllExchanges, getVisibleExchanges, createExchange, updateExchange, deleteExchange } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';
        const exchanges = all ? await getAllExchanges() : await getVisibleExchanges();
        return NextResponse.json(exchanges);
    } catch (error) {
        console.error('Error fetching exchanges:', error);
        return NextResponse.json({ error: 'Failed to fetch exchanges' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const id = await createExchange({
            name: body.name,
            badge: body.badge || '',
            badgeColor: body.badgeColor || '#f0b90b',
            bonus: body.bonus || '',
            gradient: body.gradient || '',
            glowColor: body.glowColor || '',
            logo: body.logo || '🟡',
            features: body.features || '[]',
            link: body.link || '#',
            sortOrder: body.sortOrder || 0,
            isVisible: body.isVisible !== false,
        });
        return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
        console.error('Error creating exchange:', error);
        return NextResponse.json({ error: 'Failed to create exchange' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const success = await updateExchange(id, data);
        if (success) return NextResponse.json({ success: true });
        return NextResponse.json({ error: 'Exchange not found' }, { status: 404 });
    } catch (error) {
        console.error('Error updating exchange:', error);
        return NextResponse.json({ error: 'Failed to update exchange' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get('id'));
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const success = await deleteExchange(id);
        if (success) return NextResponse.json({ success: true });
        return NextResponse.json({ error: 'Exchange not found' }, { status: 404 });
    } catch (error) {
        console.error('Error deleting exchange:', error);
        return NextResponse.json({ error: 'Failed to delete exchange' }, { status: 500 });
    }
}
