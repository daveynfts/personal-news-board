import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456A@a';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        if (password === ADMIN_PASSWORD) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
