'use client';

import { useRef, useCallback, useEffect } from 'react';

interface SwipeOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number; // minimum px to count as a swipe (default: 50)
}

/**
 * Hook that detects horizontal swipe gestures on a DOM element.
 * Returns a ref to attach to the target element.
 */
export function useSwipe<T extends HTMLElement = HTMLDivElement>({
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
}: SwipeOptions) {
    const ref = useRef<T>(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isSwiping = useRef(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isSwiping.current = true;
    }, []);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (!isSwiping.current) return;
        isSwiping.current = false;

        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;

        // Only trigger if horizontal movement > vertical (prevents conflict with scroll)
        if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY)) {
            return;
        }

        if (deltaX < -threshold && onSwipeLeft) {
            onSwipeLeft();
        } else if (deltaX > threshold && onSwipeRight) {
            onSwipeRight();
        }
    }, [onSwipeLeft, onSwipeRight, threshold]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd]);

    return ref;
}
