'use client';

import React, { ReactNode } from 'react';
import { useDragScroll } from '@/hooks/useDragScroll';

export default function DragScrollContainer({ 
    children, 
    className = ''
}: { 
    children: ReactNode, 
    className?: string
}) {
    const scrollRef = useDragScroll<HTMLDivElement>();

    return (
        <div 
           ref={scrollRef} 
           className={`drag-scroll-container ${className}`}
           style={{ 
               overflowX: 'auto', 
               scrollbarWidth: 'none', 
               msOverflowStyle: 'none',
               display: 'flex', 
               width: '100%',
               WebkitOverflowScrolling: 'touch'
           }}
        >
            <div 
                className="drag-scroll-inner"
                style={{ 
                    display: 'flex', 
                    gap: '40px',
                    width: 'max-content',
                    padding: '28px 0 32px 0',
                    alignItems: 'stretch'
                }}
            >
                {children}
            </div>
            <style jsx>{`
                .drag-scroll-container::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
