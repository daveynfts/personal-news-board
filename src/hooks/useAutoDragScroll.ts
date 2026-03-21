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
    
    // Use refs so the main loop never needs to be torn down and recreated
    const isPausedRef = useRef(isPaused);
    const speedRef = useRef(speed);
    const directionRef = useRef(direction);

    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    useEffect(() => { speedRef.current = speed; }, [speed]);
    useEffect(() => { directionRef.current = direction; }, [direction]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        let isDown = false;
        let startX: number;
        let scrollLeftPos: number; // For dragging specifically
        let animationFrameId: number;

        const onMouseDown = (e: MouseEvent) => {
            isDown = true;
            setIsPaused(true);
            el.style.cursor = 'grabbing';
            startX = e.pageX - el.offsetLeft;
            scrollLeftPos = el.scrollLeft;
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
            el.scrollLeft = scrollLeftPos - walk;
        };

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);
        el.style.cursor = 'grab';

        // Set fractional scroll strictly based on the actual starting DOM state
        let fractionalScroll = el.scrollLeft;

        const loop = () => {
            if (!isPausedRef.current && !isDown) {
                const spd = speedRef.current || 0.5;
                const dir = directionRef.current || 'left';
                
                // If browser randomly snapped scrollLeft away from fractional (e.g. user touchpad scrolled), sync it
                if (Math.abs(el.scrollLeft - fractionalScroll) > 2) {
                    fractionalScroll = el.scrollLeft;
                }

                if (dir === 'left') {
                    fractionalScroll += spd;
                    if (fractionalScroll >= el.scrollWidth / 2) {
                        fractionalScroll = 0;
                    }
                } else {
                    fractionalScroll -= spd;
                    if (fractionalScroll <= 0) {
                        fractionalScroll = el.scrollWidth / 2;
                    }
                }
                
                el.scrollLeft = fractionalScroll;
            } else {
                // If paused or dragging, stay strictly synced with DOM
                fractionalScroll = el.scrollLeft;
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
    }, []); // Empty dependency array! Only mounts once per component.

    return { scrollRef, setIsPaused };
}
