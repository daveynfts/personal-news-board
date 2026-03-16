import { NextResponse } from 'next/server';
import { togglePostMore } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, isMore } = body;

        if (typeof id !== 'number' || typeof isMore !== 'boolean') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const success = await togglePostMore(id, isMore);
        if (!success) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        revalidatePath('/');
        revalidatePath('/more');
        revalidatePath('/picks');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to toggle post more:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}
