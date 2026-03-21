import { useRef, useEffect, useState } from 'react';

/**
 * Hook to make any overflow-x scrollable container draggable with mouse,
 * while automatically scrolling content horizontally (JS-based marquee).
 */
export function useAutoDragScroll<T extends HTMLElement>({
    speed = 0.5,
    direction = 'left',
}: {
    speed?: number;
    direction?: 'left' | 'right';
} = {}) {
    const scrollRef = useRef<T>(null);
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
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const onMouseLeave = () => {
            if (isDown) {
                isDown = false;
                el.style.cursor = 'grab';
            }
            setIsPaused(false);
        };

        const onMouseUp = () => {
            isDown = false;
            el.style.cursor = 'grab';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5;
            el.scrollLeft = scrollLeft - walk;
        };

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);
        el.style.cursor = 'grab';

        // Infinite loop auto-scroll logic
        const loop = () => {
            if (!isPaused && !isDown) {
                if (direction === 'left') {
                    el.scrollLeft += speed;
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

        animationFrameId = requestAnimationFrame(loop);

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPaused, speed, direction]);

    return { scrollRef, setIsPaused };
}
