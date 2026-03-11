import { NextResponse } from 'next/server';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '@/lib/db';

export async function GET() {
    try {
        const events = await getAllEvents();
        return NextResponse.json(events);
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, date, location, link, imageUrl } = body;

        if (!title || !date) {
            return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
        }

        const id = await createEvent({ title, description, date, location, link, imageUrl });
        return NextResponse.json({ id, success: true }, { status: 201 });
    } catch (error) {
        console.error('Failed to create event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, date, location, link, imageUrl } = body;

        if (!id || !title || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const success = await updateEvent(Number(id), { title, description, date, location, link, imageUrl });
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Failed to update event:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        const success = await deleteEvent(Number(id));
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Failed to delete event:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
