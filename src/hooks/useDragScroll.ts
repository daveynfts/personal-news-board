import { useRef, useEffect } from 'react';

/**
 * Hook to make any overflow-x scrollable container draggable with mouse on desktop.
 */
export function useDragScroll<T extends HTMLElement>(externalRef?: React.RefObject<T>) {
    const internalRef = useRef<T>(null);
    const scrollRef = externalRef || internalRef;

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        let isDown = false;
        let startX: number;
        let scrollLeft: number;

        const onMouseDown = (e: MouseEvent) => {
            isDown = true;
            el.classList.add('is-dragging'); // Optional styling
            el.style.cursor = 'grabbing';
            el.style.scrollBehavior = 'auto'; // Remove smooth scroll to avoid drag lag
            
            // Allow clicking links if we don't move much
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const onMouseLeave = () => {
            if (!isDown) return;
            isDown = false;
            el.classList.remove('is-dragging');
            el.style.cursor = 'grab';
        };

        const onMouseUp = () => {
            isDown = false;
            el.classList.remove('is-dragging');
            el.style.cursor = 'grab';
            
            // Restore snap or smooth behavior if needed
            el.style.scrollBehavior = 'smooth';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault(); // Stop text selection
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag speed multiplier
            el.scrollLeft = scrollLeft - walk;
        };

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);
        
        el.style.cursor = 'grab';

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return scrollRef;
}
