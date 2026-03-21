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
                style={{ 
                    display: 'flex', 
                    gap: '40px',
                    width: 'max-content',
                    padding: '24px 0'
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
