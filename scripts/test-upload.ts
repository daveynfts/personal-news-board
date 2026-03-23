import { createClient } from 'next-sanity';
import fs from 'fs';
import path from 'path';

require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xrgxn8ov',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-20',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function run() {
    try {
        console.log("Đang bắt đầu tạo file ảnh giả để upload...");
        // Tạo 1 file ảnh 1x1 pixel bé xíu để test
        const imgBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        const tempPath = path.join(__dirname, 'test.png');
        fs.writeFileSync(tempPath, imgBuffer);
        
        console.log("Đang gọi Sanity API để Upload Asset...");
        const response = await client.assets.upload('image', fs.createReadStream(tempPath), {
            filename: 'test.png',
            contentType: 'image/png'
        });
        
        console.log("✅ Upload Thành Công! Đây là ID của ảnh vừa tải lên:");
        console.log(response._id);
        
        // Clean up
        fs.unlinkSync(tempPath);
    } catch (e: any) {
        console.error("❌ Upload THẤT BẠI. Dưới đây là thông báo lỗi từ máy chủ API Sanity:");
        console.error(e.response ? e.response.body : e.message);
    }
}

run();
