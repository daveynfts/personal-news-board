import { NextResponse } from 'next/server';
import { updateEvent, deleteEvent } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        const body = await request.json();
        const success = await updateEvent(Number(id), body);
        if (!success) {
            return NextResponse.json({ error: 'Event not found or no changes made' }, { status: 404 });
        }
        revalidatePath('/');
        revalidatePath('/events');
        return NextResponse.json({ success: true });
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
        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        const success = await deleteEvent(Number(id));
        if (!success) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }
        revalidatePath('/');
        revalidatePath('/events');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete event:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
