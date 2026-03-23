const { createClient } = require('next-sanity');
const fs = require('fs');
const path = require('path');
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
        console.log("Đang gọi Sanity API Upload Asset...");
        const imgBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        const tempPath = path.join(__dirname, 'test2.png');
        fs.writeFileSync(tempPath, imgBuffer);
        
        const response = await client.assets.upload('image', fs.createReadStream(tempPath), {
            filename: 'test2.png',
            contentType: 'image/png'
        });
        
        console.log("SUCCESS_ID:", response._id);
        fs.unlinkSync(tempPath);
    } catch (e) {
        console.error("ERROR_MSG:", e.message);
        if (e.response) console.error("ERROR_RESP:", e.response.body);
    }
}

run().then(() => console.log("DONE"));
