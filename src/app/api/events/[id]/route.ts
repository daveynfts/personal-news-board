import { NextResponse } from 'next/server';
import { updateEvent, deleteEvent } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const success = await updateEvent(Number(id), body);
        return NextResponse.json({ success });
    } catch (error) {
        console.error('Failed to update event:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await deleteEvent(Number(id));
        return NextResponse.json({ success });
    } catch (error) {
        console.error('Failed to delete event:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
