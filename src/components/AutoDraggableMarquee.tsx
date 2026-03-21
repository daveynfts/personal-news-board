'use client';

import React, { ReactNode } from 'react';
import { useAutoDragScroll } from '@/hooks/useAutoDragScroll';

export default function AutoDraggableMarquee({ 
    children, 
    direction = 'left', 
    speed = 0.5,
    className = ''
}: { 
    children: ReactNode, 
    direction?: 'left' | 'right', 
    speed?: number,
    className?: string
}) {
    const { scrollRef, setIsPaused } = useAutoDragScroll<HTMLDivElement>({ direction, speed });

    return (
        <div 
           ref={scrollRef} 
           className={`auto-draggable-marquee ${className}`}
           onMouseEnter={() => setIsPaused(true)}
           onMouseLeave={() => setIsPaused(false)}
           onTouchStart={() => setIsPaused(true)}
           onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
           style={{ 
               overflowX: 'auto', 
               scrollbarWidth: 'none', 
               msOverflowStyle: 'none',
               display: 'flex', 
               width: '100%' 
           }}
        >
            <div 
                style={{ 
                    display: 'flex', 
                    gap: '40px',
                    minWidth: '200%' // Ensure enough width to loop properly
                }}
            >
                {children}
            </div>
            {/* Hide webkit scrollbar */}
            <style jsx>{`
                .auto-draggable-marquee::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
