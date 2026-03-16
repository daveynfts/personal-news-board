import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456A@a';
const TOKEN_SECRET = process.env.TOKEN_SECRET || ADMIN_PASSWORD + '_session_secret_v1';

// Token expiry durations (ms)
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;         // 1 day (no "remember me")
const REMEMBER_EXPIRY = 30 * 24 * 60 * 60 * 1000;   // 30 days

/**
 * Creates an HMAC-signed session token.
 * Format: `<timestamp>.<signature>`
 */
function createToken(expiresAt: number): string {
    const payload = `${expiresAt}`;
    const signature = crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(payload)
        .digest('hex');
    return `${payload}.${signature}`;
}

/**
 * Verifies an HMAC-signed session token.
 * Returns true if signature is valid AND token is not expired.
 */
function verifyToken(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [expiresAtStr, providedSig] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt)) return false;

    // Check expiry
    if (Date.now() > expiresAt) return false;

    // Verify HMAC signature
    const expectedSig = crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(expiresAtStr)
        .digest('hex');

    // Timing-safe comparison
    if (providedSig.length !== expectedSig.length) return false;
    return crypto.timingSafeEqual(
        Buffer.from(providedSig, 'hex'),
        Buffer.from(expectedSig, 'hex')
    );
}

// ── POST: Login with password ─────────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password, rememberMe } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        if (password === ADMIN_PASSWORD) {
            const expiry = rememberMe ? REMEMBER_EXPIRY : SESSION_EXPIRY;
            const expiresAt = Date.now() + expiry;
            const token = createToken(expiresAt);

            return NextResponse.json({
                success: true,
                token,
                expiresAt,
            });
        } else {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

// ── GET: Verify existing session token ────────────────────────────────────────
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const valid = verifyToken(token);
        return NextResponse.json({ valid });
    } catch {
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
