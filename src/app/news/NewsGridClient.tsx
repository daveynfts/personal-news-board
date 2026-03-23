'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, ChevronDown } from 'lucide-react';

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
  const [visibleCount, setVisibleCount] = useState(12);
  const [activeTab, setActiveTab] = useState<'Research' | 'Article'>('Research');

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, filteredItems.length));
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop';

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button 
          onClick={() => { setActiveTab('Research'); setVisibleCount(12); }}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${activeTab === 'Research' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'}`}
        >
          Research
        </button>
        <button 
          onClick={() => { setActiveTab('Article'); setVisibleCount(12); }}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${activeTab === 'Article' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'}`}
        >
          Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleItems.map((news) => {
          const href = news.url ? news.url : `/article/${news.slug || news.id}`;
          const isExternal = !!news.url;
          const imgSrc = news.imageUrl || FALLBACK_IMAGE;

          return (
            <a
              key={news.id}
              href={href}
              target={isExternal ? '_blank' : '_self'}
              rel={isExternal ? 'noopener noreferrer' : ''}
              className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden group hover:border-white/30 hover:bg-white/5 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] glass-shine"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-900 border-b border-white/5">
                <Image 
                  src={imgSrc} 
                  alt={news.title} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  className="group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">↗</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${news.type === 'Research' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'} border`}>
                    {news.type}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {news.createdAt ? new Date(news.createdAt).toLocaleDateString('vi-VN') : 'Mới nhất'}
                  </span>
                </div>
                <h3 className="text-gray-200 font-medium text-lg leading-[1.4] group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all line-clamp-3">
                  {news.title}
                </h3>
              </div>
            </a>
          );
        })}
      </div>

      {visibleCount < filteredItems.length && (
        <div className="mt-16 flex justify-center">
          <button 
            onClick={loadMore}
            className="flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 group"
          >
            Tải thêm ({filteredItems.length - visibleCount})
            <ChevronDown size={18} className="text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      )}
      
      {filteredItems.length === 0 && (
        <div className="text-center py-24 bg-black/20 rounded-3xl border border-white/10 mt-8">
          <Newspaper size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
          <h3 className="text-xl text-gray-400 font-medium tracking-wide">Chưa có bài viết nào</h3>
        </div>
      )}
    </div>
  );
}
