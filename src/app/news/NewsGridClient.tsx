'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import { Newspaper, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/LanguageContext';

interface NewsItem {
  id?: number | string;
  title: string;
  url?: string;
  slug?: string;
  imageUrl?: string | null;
  createdAt?: string;
  type?: string;
  isMore?: boolean;
}

export default function NewsGridClient({ items }: { items: NewsItem[] }) {
  const { t, locale } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(12);
  

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, filteredItems.length));
  };

  const filteredItems = items;

  const visibleItems = filteredItems.slice(0, visibleCount);
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop';

  return (
    <div className="w-full">
      {/* Tabs */}
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {visibleItems.map(news => (
          <PostCard key={news.id} post={news as any} />
        ))}
      </div>

      {visibleCount < filteredItems.length && (
        <div className="mt-16 flex justify-center">
          <button 
            onClick={loadMore}
            className="flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 group"
          >
            {t('newshero.waitForMore')} ({filteredItems.length - visibleCount})
            <ChevronDown size={18} className="text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      )}
      
      {filteredItems.length === 0 && (
        <div className="text-center py-24 bg-black/20 rounded-3xl border border-white/10 mt-8">
          <Newspaper size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
          <h3 className="text-xl text-gray-400 font-medium tracking-wide">{t('archive.noArticles')}</h3>
        </div>
      )}
    </div>
  );
}
