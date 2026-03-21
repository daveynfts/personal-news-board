import { useRef, useEffect, useState } from 'react';

/**
 * Hook to make any overflow-x scrollable container draggable with mouse,
 * while automatically scrolling content horizontally (JS-based marquee).
 * 
 * Uses a lazy-attach pattern: the rAF loop runs from mount, but only begins
 * scrolling once scrollRef.current becomes available (e.g. after async data loads).
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

    // Use refs so the rAF loop reads live values without needing to teardown/recreate
    const isPausedRef = useRef(isPaused);
    const speedRef = useRef(speed);
    const directionRef = useRef(direction);

    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    useEffect(() => { speedRef.current = speed; }, [speed]);
    useEffect(() => { directionRef.current = direction; }, [direction]);

    useEffect(() => {
        let animationFrameId: number;
        let el: T | null = null;
        let fractionalScroll = 0;
        let isDown = false;
        let startX = 0;
        let scrollLeftPos = 0;
        let listenersAttached = false;

        const onMouseDown = (e: MouseEvent) => {
            isDown = true;
            isPausedRef.current = true;
            setIsPaused(true);
            if (el) {
                el.style.cursor = 'grabbing';
                startX = e.pageX - el.offsetLeft;
                scrollLeftPos = el.scrollLeft;
            }
        };

        const onMouseLeave = () => {
            if (isDown) {
                isDown = false;
                if (el) el.style.cursor = 'grab';
            }
            isPausedRef.current = false;
            setIsPaused(false);
        };

        const onMouseUp = () => {
            isDown = false;
            if (el) el.style.cursor = 'grab';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown || !el) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5;
            el.scrollLeft = scrollLeftPos - walk;
        };

        const attachListeners = (element: T) => {
            if (listenersAttached) return;
            element.addEventListener('mousedown', onMouseDown);
            element.addEventListener('mouseleave', onMouseLeave);
            element.addEventListener('mouseup', onMouseUp);
            element.addEventListener('mousemove', onMouseMove);
            element.style.cursor = 'grab';
            listenersAttached = true;
        };

        const detachListeners = (element: T) => {
            element.removeEventListener('mousedown', onMouseDown);
            element.removeEventListener('mouseleave', onMouseLeave);
            element.removeEventListener('mouseup', onMouseUp);
            element.removeEventListener('mousemove', onMouseMove);
            listenersAttached = false;
        };

        const loop = () => {
            // Lazy-attach: keep polling for the ref until it's available
            if (!el) {
                el = scrollRef.current;
                if (el) {
                    attachListeners(el);
                    fractionalScroll = el.scrollLeft;
                }
            }

            if (el && !isPausedRef.current && !isDown) {
                const spd = speedRef.current || 0.5;
                const dir = directionRef.current || 'left';

                // If external interaction moved scrollLeft away, re-sync
                if (Math.abs(el.scrollLeft - fractionalScroll) > 2) {
                    fractionalScroll = el.scrollLeft;
                }

                if (dir === 'left') {
                    fractionalScroll += spd;
                    if (el.scrollWidth > 0 && fractionalScroll >= el.scrollWidth / 2) {
                        fractionalScroll = 0;
                    }
                } else {
                    fractionalScroll -= spd;
                    if (fractionalScroll <= 0 && el.scrollWidth > 0) {
                        fractionalScroll = el.scrollWidth / 2;
                    }
                }

                el.scrollLeft = fractionalScroll;
            } else if (el && (isPausedRef.current || isDown)) {
                // Stay synced with physical scroll position while paused/dragging
                fractionalScroll = el.scrollLeft;
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (el) detachListeners(el);
        };
    }, []); // Stable mount — never tears down

    return { scrollRef, setIsPaused };
}
