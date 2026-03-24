import React, { useEffect, useState } from 'react';
import type { PreviewProps } from 'sanity';

interface TweetData {
  text: string;
  user: {
    name: string;
    screen_name: string;
    profile_image_url_https: string;
  };
  photos?: Array<{ url: string }>;
}

export function TweetPreview(props: PreviewProps & { tweetId?: string; label?: string }) {
  const { tweetId, label } = props as any;
  const [tweetData, setTweetData] = useState<TweetData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tweetId) return;
    
    setLoading(true);
    fetch(`/api/tweet/${tweetId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setTweetData(data);
        }
      })
      .catch(err => console.error('Failed to fetch tweet:', err))
      .finally(() => setLoading(false));
  }, [tweetId]);

  let title = label || (loading ? 'Đang tải Twitter...' : 'Chưa có Label');
  let subtitle = tweetId ? `ID: ${tweetId}` : 'Chưa nhập ID';
  let media = props.media;

  if (tweetData && !loading) {
    // If no custom label is provided, show the actual text of the tweet
    if (!label) {
       title = tweetData.text.length > 50 ? tweetData.text.substring(0, 50) + '...' : tweetData.text;
    }
    // Show Author as subtitle
    subtitle = `${tweetData.user.name} (@${tweetData.user.screen_name})`;
    
    // Choose the first attached image, or default to the user's avatar
    const mediaUrl = tweetData.photos?.[0]?.url || tweetData.user?.profile_image_url_https;
    if (mediaUrl) {
      media = <img src={mediaUrl} alt="Preview" style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '4px' }} />;
    } else {
      // Fallback icon if no media or avatar available
      media = <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>𝕏</span>;
    }
  }

  return props.renderDefault({
    ...props,
    title,
    subtitle,
    media,
  });
}
