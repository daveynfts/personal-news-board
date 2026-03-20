const { createClient } = require('next-sanity');

const client = createClient({
  projectId: 'xrgxn8ov',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
});

async function main() {
  const query = `*[_type == "article" && slug.current == "lo-dien-5-san-giao-dich-tai-san-so-lot-qua-vong-so-loai-cua-bo-tai-chinh"] { _id, title }`;
  const result = await client.fetch(query);
  console.log("Tìm kiếm KHÔNG CÓ TOKEN (Chế độ Người dùng Vercel Public):", result);
  
  if (result.length === 0) {
      console.log("--> Bài báo không tồn tại trong CSDL Public. Khả năng cao chưa được nhấn nút Publish mà mới chỉ nhấn Save dưới dạng Drafts.");
  }
}

main().catch(console.error);
