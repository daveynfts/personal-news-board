'use client';
import { useEffect, useState } from 'react';

export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPosition = window.scrollY;
            const percentage = totalHeight > 0 ? (scrollPosition / totalHeight) * 100 : 0;
            setProgress(percentage);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            backgroundColor: 'transparent',
            zIndex: 9999,
        }}>
            <div style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: 'var(--accent-color, #0A84FF)',
                transition: 'width 0.1s ease-out',
                boxShadow: '0 0 10px var(--accent-color, rgba(10, 132, 255, 0.5))'
            }} />
        </div>
    );
}
