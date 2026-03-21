import { useRef, useEffect, useState } from 'react';

/**
 * Hook for dragging horizontally-scrollable containers with the mouse,
 * and optionally auto-scrolling infinitely (JS-based).
 */
export function useInfiniteDragScroll({
    autoScroll = true,
    speed = 1,
    direction = 'left',
}: {
    autoScroll?: boolean;
    speed?: number;
    direction?: 'left' | 'right';
} = {}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        let isDown = false;
        let startX: number;
        let scrollLeft: number;
        let animationFrameId: number;

        const onMouseDown = (e: MouseEvent) => {
            isDown = true;
            setIsPaused(true);
            el.style.cursor = 'grabbing';
            el.style.scrollSnapType = 'none'; // disable snapping while dragging
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const onMouseLeave = () => {
            if (isDown) {
                isDown = false;
                el.style.cursor = 'grab';
                el.style.scrollSnapType = '';
            }
            setIsPaused(false);
        };

        const onMouseUp = () => {
            isDown = false;
            el.style.cursor = 'grab';
            el.style.scrollSnapType = '';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast multiplier
            el.scrollLeft = scrollLeft - walk;
        };

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);
        
        // Initial cursor style
        el.style.cursor = 'grab';

        // Auto-scroll loop
        const loop = () => {
            if (autoScroll && !isPaused && !isDown) {
                if (direction === 'left') {
                    el.scrollLeft += speed;
                    // Infinite loop reset (assuming double content)
                    if (el.scrollLeft >= el.scrollWidth / 2) {
                        el.scrollLeft = 0;
                    }
                } else {
                    el.scrollLeft -= speed;
                    if (el.scrollLeft <= 0) {
                        el.scrollLeft = el.scrollWidth / 2;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        if (autoScroll) {
            animationFrameId = requestAnimationFrame(loop);
        }

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [autoScroll, isPaused, speed, direction]);

    return { scrollRef, setIsPaused };
}
