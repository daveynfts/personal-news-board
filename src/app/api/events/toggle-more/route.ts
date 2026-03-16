import { NextResponse } from 'next/server';
import { toggleEventMore } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, isMore } = body;

        if (typeof id !== 'number' || typeof isMore !== 'boolean') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const success = await toggleEventMore(id, isMore);
        if (!success) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        revalidatePath('/');
        revalidatePath('/more');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to toggle event more:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}
