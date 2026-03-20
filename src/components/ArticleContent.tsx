'use client';

import ReactMarkdown from 'react-markdown';
import { Tweet } from 'react-tweet';
import { PortableText } from '@portabletext/react';
import { urlForImage } from '@/sanity/lib/image';

const TWEET_URL_REGEX = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)\S*$/;

interface Props {
    content: string | any[];
}

interface ContentBlock {
    type: 'markdown' | 'tweet';
    content: string; 
}

function parseMarkdownContent(raw: string): ContentBlock[] {
    const lines = raw.split('\n');
    const blocks: ContentBlock[] = [];
    let mdBuffer: string[] = [];

    const flushMd = () => {
        if (mdBuffer.length > 0) {
            blocks.push({ type: 'markdown', content: mdBuffer.join('\n') });
            mdBuffer = [];
        }
    };

    for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(TWEET_URL_REGEX);
        if (match) {
            flushMd();
            blocks.push({ type: 'tweet', content: match[1] });
        } else {
            mdBuffer.push(line);
        }
    }
    flushMd();

    return blocks;
}

const customPortableTextComponents = {
  types: {
    twitter: ({ value }: any) => {
      const match = value.url?.match(TWEET_URL_REGEX);
      const tweetId = match ? match[1] : null;
      if (!tweetId) return null;
      return (
        <div className="article-tweet-embed" data-theme="dark">
            <Tweet id={tweetId} />
        </div>
      );
    },
    image: ({ value }: any) => {
       if (!value || !value.asset) return null;
       const url = urlForImage(value)?.url();
       if (!url) return null;
       
       return (
           <figure className="article-image-figure" style={{ margin: '32px 0', width: '100%' }}>
               <img 
                   src={url} 
                   alt={value.alt || 'Article embedded image'} 
                   style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
                   loading="lazy"
               />
               {value.caption && (
                   <figcaption style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                       {value.caption}
                   </figcaption>
               )}
           </figure>
       );
    }
  }
};

export default function ArticleContent({ content }: Props) {
    if (!content) return null;

    // Handle string content (Legacy Markdown)
    if (typeof content === 'string') {
        const blocks = parseMarkdownContent(content);
        return (
            <>
                {blocks.map((block, i) => {
                    if (block.type === 'tweet') {
                        return (
                            <div key={i} className="article-tweet-embed" data-theme="dark">
                                <Tweet id={block.content} />
                            </div>
                        );
                    }
                    return (
                        <div key={i}>
                            <ReactMarkdown>{block.content}</ReactMarkdown>
                        </div>
                    );
                })}
            </>
        );
    }

    // Handle Sanity Portable Text
    if (Array.isArray(content)) {
        return <PortableText value={content} components={customPortableTextComponents} />;
    }

    return null;
}
