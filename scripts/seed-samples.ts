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

const sampleData = [
  {
    title: "Bitcoin price tussle at $70K may hint that market bottom is not in",
    category: "Market Analysis",
    author: "Biraajmaan Tamuly",
    isEditor: true,
    isHot: true,
    imageUrl: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?q=80&w=1200"
  },
  {
    title: "SEC interpretation on crypto laws 'a beginning, not an end,' says Atkins",
    category: "Regulation",
    author: "Jane Doe",
    isEditor: true,
    isHot: false,
    imageUrl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=1200"
  },
  {
    title: "Crypto industry ties were a liability in Illinois primary",
    category: "Politics",
    author: "John Smith",
    isEditor: false,
    isHot: true,
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200"
  },
  {
    title: "Are DeFi devs liable for the illegal activity of others on their platforms?",
    category: "Opinion",
    author: "Mike Johnson",
    isEditor: true,
    isHot: true,
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200"
  },
  {
    title: "The era of listings and on-ramps is ending, as intent protocols make access native",
    category: "Tech",
    author: "Sarah Connor",
    isEditor: false,
    isHot: true,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200"
  },
  {
    title: "Mu Digital partners with Curated to bring institutional-grade Asian credit to Ethereum",
    category: "DeFi",
    author: "Oliver Twist",
    isEditor: true,
    isHot: false,
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f4fc8bc?q=80&w=1200"
  },
  {
    title: "TRON joins Agentic AI Foundation to support open infrastructure for autonomous systems",
    category: "AI",
    author: "Tim Berners",
    isEditor: true,
    isHot: false,
    imageUrl: "https://images.unsplash.com/photo-1516245834210-c4c14271569b?q=80&w=1200"
  },
  {
    title: "Nasdaq-listed company CIMG signs strategic agreement to acquire IZUMI Finance",
    category: "Finance",
    author: "Elon Satoshi",
    isEditor: false,
    isHot: true,
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200"
  }
];

async function seed() {
  console.log("Starting seed process...");
  for (let i = 0; i < sampleData.length; i++) {
    const data = sampleData[i];
    console.log(`Processing: ${data.title}`);
    try {
      const imageAssetId = await uploadImageFromUrl(data.imageUrl);
      
      const doc = {
        _type: 'article',
        title: data.title,
        slug: { _type: 'slug', current: `sample-${i}-${Date.now()}` },
        category: data.category,
        authorName: data.author,
        isEditorialPick: data.isEditor,
        isHotStory: data.isHot,
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
        coverImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAssetId }
        },
        content: [
          {
            _type: 'block',
            children: [{ _type: 'span', text: 'This is a sample article generated to test the NewsHero layout rendering.' }]
          }
        ]
      };
      
      await client.create(doc);
      console.log(`Created document: ${data.title}`);
    } catch (e) {
      console.error(`Failed to process ${data.title}:`, e);
    }
  }
  console.log("Done!");
}

seed();
