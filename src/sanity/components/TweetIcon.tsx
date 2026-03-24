import React, { useEffect, useState } from 'react';

export function TweetIcon({ tweetId }: { tweetId?: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!tweetId) return;
    
    // Fetch tweet data dynamically from our Next.js API route
    fetch(`/api/tweet/${tweetId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          // Priority 1: Tweet Photos. Priority 2: User Avatar
          const url = data.photos?.[0]?.url || data.user?.profile_image_url_https;
          if (url) setImgUrl(url);
        }
      })
      .catch((err) => console.error('Error fetching tweet icon:', err));
  }, [tweetId]);

  if (imgUrl) {
    return <img src={imgUrl} alt="X" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />;
  }
  
  // Fallback while loading or if no media exists
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '1rem', backgroundColor: '#000', color: '#fff', borderRadius: '4px' }}>
      𝕏
    </span>
  );
}
