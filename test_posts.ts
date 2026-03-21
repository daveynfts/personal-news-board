import { getAllPosts } from './src/lib/db';

async function test() {
  const posts = await getAllPosts();
  console.log(JSON.stringify(posts, null, 2));
}

test().catch(console.error);
