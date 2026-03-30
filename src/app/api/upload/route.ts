import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
    // BẢO MẬT: Kiểm tra xem request có gửi kèm Secret Key không (Chống spam API)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.UPLOAD_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized: Bạn không có quyền upload!' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename || !request.body) {
        return NextResponse.json({ error: 'Filename and body are required' }, { status: 400 });
    }

    try {
        const arrayBuffer = await request.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const ext = path.extname(filename);
        const baseName = path.basename(filename, ext);
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const safeFilename = `${baseName}-${uniqueSuffix}${ext}`;

        if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME) {
            const S3 = new S3Client({
                region: "auto",
                endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY_ID,
                    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
                },
            });

            await S3.send(
                new PutObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: safeFilename,
                    Body: buffer,
                    ContentType: request.headers.get("content-type") || "application/octet-stream",
                })
            );

            const publicUrl = process.env.R2_PUBLIC_URL 
                ? `${process.env.R2_PUBLIC_URL}/${safeFilename}`
                : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${safeFilename}`; 

            return NextResponse.json({ url: publicUrl, pathname: safeFilename, downloadUrl: publicUrl });
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, safeFilename);
        await writeFile(filePath, buffer);

        const url = `/uploads/${safeFilename}`;
        return NextResponse.json({ url, pathname: safeFilename, downloadUrl: url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
