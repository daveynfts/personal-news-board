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
           <figure className="article-image-figure" style={{ margin: '32px 0 40px', width: '100%' }}>
               <img 
                   src={url} 
                   alt={value.caption || value.attribution || 'Article embed'} 
                   style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
                   loading="lazy"
               />
               {(value.caption || value.attribution) && (
                   <figcaption className="article-image-caption">
                       {value.caption && <span className="caption-text">{value.caption}</span>}
                       {value.caption && value.attribution && <span className="caption-divider"> | </span>}
                       {value.attribution && (
                           <span className="attribution-text">
                               {value.attributionUrl ? (
                                   <a href={value.attributionUrl} target="_blank" rel="noopener nofollow">
                                       Nguồn: {value.attribution}
                                   </a>
                               ) : `Nguồn: ${value.attribution}`}
                           </span>
                       )}
                   </figcaption>
               )}
           </figure>
       );
    },
    pullQuote: ({ value }: any) => {
      if (!value || !value.quote) return null;
      return (
          <div className="pull-quote-wrapper">
              <svg className="pull-quote-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.570 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="pull-quote-text">
                  {value.quote}
              </blockquote>
              <div className="pull-quote-meta">
                  <span className="pull-quote-author">— {value.author}</span>
                  {value.roleOrSource && (
                      <>
                          <span className="pull-quote-divider">,</span>
                          <span className="pull-quote-role">
                              {value.sourceUrl ? (
                                  <a href={value.sourceUrl} target="_blank" rel="noopener nofollow">
                                      {value.roleOrSource}
                                  </a>
                              ) : value.roleOrSource}
                          </span>
                      </>
                  )}
              </div>
          </div>
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
