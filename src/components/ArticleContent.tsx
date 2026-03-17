'use client';

import ReactMarkdown from 'react-markdown';
import { Tweet } from 'react-tweet';

// Regex: X/Twitter status URL on its own line
const TWEET_URL_REGEX = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)\S*$/;

interface Props {
    content: string;
}

interface ContentBlock {
    type: 'markdown' | 'tweet';
    content: string; // markdown text or tweet ID
}

function parseContent(raw: string): ContentBlock[] {
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

export default function ArticleContent({ content }: Props) {
    const blocks = parseContent(content);

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
