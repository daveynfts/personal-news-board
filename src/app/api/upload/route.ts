import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename || !request.body) {
        return NextResponse.json({ error: 'Filename and body are required' }, { status: 400 });
    }

    try {
        // Check if Vercel Blob is configured
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Use Vercel Blob in production
            const { put } = await import('@vercel/blob');
            const blob = await put(filename, request.body, {
                access: 'public',
                addRandomSuffix: true,
            });
            return NextResponse.json(blob);
        }

        // Fallback: save to local /public/uploads/ directory for local development
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        // Generate a unique filename to avoid collisions
        const ext = path.extname(filename);
        const baseName = path.basename(filename, ext);
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const safeFilename = `${baseName}-${uniqueSuffix}${ext}`;

        // Read the request body as a buffer
        const arrayBuffer = await request.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const filePath = path.join(uploadsDir, safeFilename);
        await writeFile(filePath, buffer);

        // Return a URL that can be served by Next.js static files
        const url = `/uploads/${safeFilename}`;
        return NextResponse.json({ url, pathname: safeFilename, downloadUrl: url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
