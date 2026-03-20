import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-20',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function uploadImageFromUrl(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const asset = await client.assets.upload('image', Buffer.from(buffer), {
    filename: 'sample-image.jpg'
  });
  return asset._id;
}

const tweets = [
  { tweetId: "1798363574069354972", label: "Market Insights", category: "analysis" },
  { tweetId: "1801833506161864887", label: "Alpha Drop", category: "alpha" },
  { tweetId: "1778036254415446059", label: "Breaking News", category: "breaking" },
  { tweetId: "1791722881183592825", label: "Thread", category: "thread" }
];

const events = [
  { title: "Token2049 Dubai", date: "2026-04-18T09:00:00Z", location: "Dubai, UAE", description: "The premier crypto event in Dubai.", link: "https://token2049.com", isFeatured: true, status: "upcoming" },
  { title: "Consensus 2026", date: "2026-05-29T10:00:00Z", location: "Austin, Texas", description: "The largest, longest-running gathering of the decentralized web community.", link: "https://consensus.coindesk.com", isFeatured: false, status: "going" },
  { title: "Devcon 7", date: "2026-11-12T09:00:00Z", location: "Southeast Asia", description: "Annual conference for all Ethereum developers, researchers, and community.", link: "https://devcon.org", isFeatured: false, status: "upcoming" },
];

const posts = [
  { type: "article", title: "Why Modular Blockchains are the Future", url: "https://example.com/modular", imageUrl: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?q=80&w=600" },
  { type: "video", title: "Understanding Zero-Knowledge Proofs in 10 Minutes", url: "https://youtube.com/watch?example", imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f4fc8bc?q=80&w=600" },
  { type: "news", title: "Ethereum ETF Approval Expected Next Week", url: "https://example.com/etf", imageUrl: "https://images.unsplash.com/photo-1622630998477-20b41cd0e073?q=80&w=600" },
  { type: "tweet", title: "Vitalik Buterin's latest vision on roadmap", url: "https://twitter.com/VitalikButerin/status/123", imageUrl: "https://images.unsplash.com/photo-1516245834210-c4c14271569b?q=80&w=600" },
  { type: "article", title: "Restaking: The next DeFi primitive", url: "https://example.com/restaking", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600" },
];

async function seed() {
  console.log("Seeding Tweets...");
  for (let i = 0; i < tweets.length; i++) {
    await client.create({ _type: 'embeddedTweet', ...tweets[i], sortOrder: i });
  }

  console.log("Seeding Events...");
  for (let i = 0; i < events.length; i++) {
    await client.create({ _type: 'event', ...events[i] });
  }

  console.log("Seeding Posts...");
  for (let i = 0; i < posts.length; i++) {
    console.log(`Uploading image for post ${posts[i].title}...`);
    let imageAssetId = null;
    try {
      if (posts[i].imageUrl) {
        imageAssetId = await uploadImageFromUrl(posts[i].imageUrl);
      }
    } catch (e) {
      console.log(`Failed to upload image for ${posts[i].title}, proceeding without image.`);
    }
    await client.create({
      _type: 'post',
      type: posts[i].type,
      title: posts[i].title,
      url: posts[i].url,
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      ...(imageAssetId ? {
        imageUrl: {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAssetId }
        }
      } : {})
    });
  }

  console.log("Mockup data seeded successfully!");
}

seed().catch(console.error);
