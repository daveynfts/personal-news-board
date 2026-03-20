'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/LanguageContext';

export interface SanityNewsArticle {
  id?: string | number;
  title: string;
  slug?: string;
  coverImage?: string;
  category?: string;
  authorName?: string;
  createdAt?: string;
  isEditorialPick?: boolean;
  isHotStory?: boolean;
}

interface NewsHeroProps {
  featuredArticles: SanityNewsArticle[]; 
  editorChoices: SanityNewsArticle[];    
  hotStories: SanityNewsArticle[];       
  latestNews: SanityNewsArticle[];       
}

export default function NewsHero({
  featuredArticles = [],
  editorChoices = [],
  hotStories = [],
  latestNews = []
}: NewsHeroProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'editor' | 'hot'>('editor');
  const [currentFeaturedIdx, setCurrentFeaturedIdx] = useState(0);

  const currentList = activeTab === 'editor' ? editorChoices : hotStories;
  const featured = currentList[currentFeaturedIdx] || featuredArticles[currentFeaturedIdx] || featuredArticles[0];
  const rightColArticles = currentList;

  const nextFeatured = () => {
    const listLen = currentList.length > 0 ? currentList.length : featuredArticles.length;
    if(listLen > 0)
        setCurrentFeaturedIdx((prev) => (prev + 1) % listLen);
  };
  const prevFeatured = () => {
    const listLen = currentList.length > 0 ? currentList.length : featuredArticles.length;
    if(listLen > 0)
        setCurrentFeaturedIdx((prev) => (prev - 1 + listLen) % listLen);
  };

  const handleTabChange = (tab: 'editor' | 'hot') => {
    setActiveTab(tab);
    setCurrentFeaturedIdx(0);
  };

  return (
    <>
    <style>{`
      @keyframes scroll-left {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
      @keyframes scroll-right {
        0% { transform: translateX(-33.333%); }
        100% { transform: translateX(0); }
      }
      .animate-scroll-left {
        display: flex;
        width: max-content;
        animation: scroll-left 30s linear infinite;
      }
      .animate-scroll-right {
        display: flex;
        width: max-content;
        animation: scroll-right 30s linear infinite;
      }
      .marquee-container:hover .animate-scroll-left,
      .marquee-container:hover .animate-scroll-right {
        animation-play-state: paused;
      }
      .glass-shine {
        position: relative;
        overflow: hidden;
      }
      .glass-shine::after {
        content: '';
        position: absolute;
        top: 0;
        left: -150%;
        width: 150%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transform: skewX(-25deg);
        transition: left 0.7s ease;
        pointer-events: none;
      }
      .glass-shine:hover::after {
        left: 200%;
      }
      @keyframes auto-shine-anim {
        0% { left: -150%; }
        20% { left: 200%; }
        100% { left: 200%; }
      }
      .auto-shine {
        position: relative;
        overflow: hidden;
      }
      .auto-shine::after {
        content: '';
        position: absolute;
        top: 0;
        left: -150%;
        width: 150%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transform: skewX(-25deg);
        animation: auto-shine-anim 4s infinite ease-in-out;
        pointer-events: none;
      }
    `}</style>
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 font-sans text-gray-100 shadow-2xl rounded-3xl mb-12 ring-1 ring-white/5">
      {/* 1. TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* LETS COLUMN (2/3): Featured Image Hero */}
        <div 
          onClick={() => { if (featured) window.location.href = `/article/${featured.slug || featured.id}` }}
          className="lg:col-span-2 relative rounded-2xl overflow-hidden flex flex-col justify-between group h-[400px] md:h-[500px] bg-black/50 shadow-inner ring-1 ring-white/10 cursor-pointer"
        >
          {featured?.coverImage ? (
            <img 
              src={featured.coverImage} 
              alt={featured.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900" />
          )}
          
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

          {/* Top Title */}
          <div className="relative z-10 p-6 pt-8 pr-12">
            <h2 className="text-3xl md:text-[42px] font-extrabold text-gray-200 leading-tight hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] transition-all duration-300 cursor-pointer tracking-tight drop-shadow-xl">
              {featured?.title || "Featured Article..."}
            </h2>
          </div>

          {/* Bottom Meta & Controls */}
          <div className="relative z-10 p-5 md:px-8 md:py-5 flex flex-wrap items-center justify-between border-t border-white/10 bg-black/40 backdrop-blur-md mt-auto">
            <div className="flex items-center space-x-5 text-sm font-semibold">
              <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)] uppercase tracking-widest">
                {featured?.category || "Market Analysis"}
              </span>
              <span className="text-gray-200 hidden sm:inline">
                {t('newshero.by')} <span className="text-white">{featured?.authorName || "Davey"}</span>
              </span>
              <span className="text-gray-400 font-medium">
                {featured?.createdAt ? new Date(featured.createdAt).toLocaleDateString() : "Just now"}
              </span>
            </div>
            
            {/* Nav Arrows */}
            <div className="flex space-x-3 mt-3 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevFeatured(); }} 
                className="carousel-control" 
                aria-label="Previous"
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextFeatured(); }} 
                className="carousel-control" 
                aria-label="Next"
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3): Tabs Header and List */}
        <div className="flex flex-col h-[400px] md:h-[500px]">
          {/* Custom Tabs */}
          <div className="flex mb-6 relative bg-black/20 p-1.5 rounded-xl border border-white/10">
            <button 
              onClick={() => handleTabChange('editor')}
              className={`flex-1 py-3 px-2 font-bold text-[15px] transition-all duration-300 rounded-lg relative overflow-hidden glass-shine ${activeTab === 'editor' ? 'bg-white/10 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/5'} flex justify-center items-center gap-2`}
            >
              <svg className="w-4 h-4 opacity-80 relative z-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              <span className="relative z-10">{t('newshero.editorsChoice')}</span>
            </button>
            <button 
              onClick={() => handleTabChange('hot')}
              className={`flex-1 py-3 px-2 font-bold text-[15px] transition-all duration-300 rounded-lg relative overflow-hidden glass-shine ${activeTab === 'hot' ? 'bg-white/10 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/5'} flex justify-center items-center gap-2`}
            >
              <svg className="w-4 h-4 opacity-80 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
              <span className="relative z-10">{t('newshero.hotStories')}</span>
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {rightColArticles.length > 0 ? rightColArticles.map((article, idx) => (
              <a 
                href={`/article/${article.slug || article.id}`} 
                key={article.id || idx} 
                onMouseEnter={() => setCurrentFeaturedIdx(idx)}
                className="block group cursor-pointer border-b border-white/10 last:border-0 pb-4"
              >
                <h3 className={`text-[16px] transition-all duration-300 leading-[1.5] group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] ${idx === currentFeaturedIdx ? 'font-bold text-gray-100 drop-shadow-sm' : 'font-medium text-gray-300'}`}>
                  {article.title}
                </h3>
              </a>
            )) : (
              // Empty
              <div className="text-gray-500 text-sm text-center pt-8">{t('newshero.noNews')}</div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM SECTION: Latest News (2 Marquees) */}
      <div className="pt-8 border-t border-white/10 overflow-hidden">
        <div className="flex justify-between items-center pb-6 mb-2">
           <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg auto-shine cursor-pointer hover:bg-white/10 transition-colors duration-300 glass-shine">
             <h3 className="text-lg md:text-[20px] font-bold text-white tracking-wide relative z-10 m-0 leading-none">
               {t('newshero.latestNews')}
             </h3>
           </div>
           
           <Link href="/news" className="text-sm font-medium text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 relative overflow-hidden group shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
             <span className="relative z-10">Xem tất cả News</span>
             <span className="relative z-10 group-hover:translate-x-1 transition-transform" aria-hidden="true">&rarr;</span>
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-out_infinite]" />
           </Link>
        </div>
        
        <div className="flex flex-col gap-4 marquee-container relative mask-edges" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
          
          {/* Top Row: Moves Left to Right */}
          <div className="animate-scroll-right gap-5 pr-5">
            {latestNews.length > 0 ? [...latestNews.slice(0, 4), ...latestNews.slice(0, 4), ...latestNews.slice(0, 4)].map((news, idx) => (
              <a href={`/article/${news.slug || news.id}`} key={`top-${news.id || idx}-${idx}`} className="flex w-[320px] p-3 border border-white/10 bg-black/20 backdrop-blur-sm rounded-xl group cursor-pointer hover:border-white/30 hover:bg-white/10 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 gap-4 glass-shine">
                <div className="w-[85px] h-[85px] flex-shrink-0 rounded-lg bg-gray-800 overflow-hidden relative ring-1 ring-white/5">
                  {news.coverImage ? (
                     <img src={news.coverImage} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-black text-white p-2">
                         <span className="text-[10px] font-bold text-indigo-300 uppercase">Logo</span>
                     </div>
                  )}
                </div>
                <div className="flex-1 flex items-center pr-2">
                  <h4 className="text-[14px] sm:text-[15px] font-medium text-gray-300 line-clamp-3 group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] transition-all duration-300 leading-snug">
                    {news.title}
                  </h4>
                </div>
              </a>
            )) : <div className="text-gray-500">{t('newshero.noNews')}</div>}
          </div>

          {/* Bottom Row: Moves Right to Left */}
          <div className="animate-scroll-left gap-5 pr-5">
            {latestNews.length > 4 ? [...latestNews.slice(4, 8), ...latestNews.slice(4, 8), ...latestNews.slice(4, 8)].map((news, idx) => (
              <a href={`/article/${news.slug || news.id}`} key={`bot-${news.id || idx}-${idx}`} className="flex w-[320px] p-3 border border-white/10 bg-black/20 backdrop-blur-sm rounded-xl group cursor-pointer hover:border-white/30 hover:bg-white/10 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 gap-4 glass-shine">
                <div className="w-[85px] h-[85px] flex-shrink-0 rounded-lg bg-gray-800 overflow-hidden relative ring-1 ring-white/5">
                  {news.coverImage ? (
                     <img src={news.coverImage} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-black text-white p-2">
                         <span className="text-[10px] font-bold text-indigo-300 uppercase">Logo</span>
                     </div>
                  )}
                </div>
                <div className="flex-1 flex items-center pr-2">
                  <h4 className="text-[14px] sm:text-[15px] font-medium text-gray-300 line-clamp-3 group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] transition-all duration-300 leading-snug">
                    {news.title}
                  </h4>
                </div>
              </a>
            )) : <div className="text-gray-500">{t('newshero.waitForMore')}</div>}
          </div>

        </div>
      </div>

    </div>
    </>
  );
}
