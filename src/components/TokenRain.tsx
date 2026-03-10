'use client';

import { useState, useEffect } from 'react';

const TOKENS = ['₿', 'Ξ', '🌕', '🚀', '💎', '📈', '🪙', '💸', '💰', '🔥'];

export default function TokenRain() {
    const [isRaining, setIsRaining] = useState(false);
    const [drops, setDrops] = useState<Array<{ id: number; token: string; left: string; duration: string; delay: string; size: string }>>([]);

    useEffect(() => {
        if (isRaining) {
            // Generate 40-50 tokens
            const newDrops = Array.from({ length: 45 }).map((_, i) => ({
                id: i,
                token: TOKENS[Math.floor(Math.random() * TOKENS.length)],
                left: `${Math.random() * 100}vw`,
                duration: `${Math.random() * 4 + 4}s`, // 4s to 8s
                delay: `${Math.random() * 5}s`, // up to 5s delay
                size: `${Math.random() * 1.5 + 1}rem` // 1rem to 2.5rem
            }));
            setDrops(newDrops);
        } else {
            setDrops([]);
        }
    }, [isRaining]);

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsRaining(!isRaining)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    zIndex: 9999,
                    background: isRaining ? 'var(--accent-color)' : 'rgba(10, 12, 17, 0.8)',
                    color: isRaining ? '#000' : 'var(--text-secondary)',
                    border: `1px solid ${isRaining ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    padding: '12px',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: isRaining ? '0 0 20px rgba(243, 186, 47, 0.5)' : '0 8px 16px rgba(0,0,0,0.5)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                }}
                title={isRaining ? "Stop the Rain" : "Make it Rain Tokens!"}
            >
                🌧️
            </button>

            {/* Rain Container */}
            {isRaining && (
                <div className="token-rain-container">
                    {drops.map(drop => (
                        <div
                            key={drop.id}
                            className="falling-token"
                            style={{
                                left: drop.left,
                                animationDuration: drop.duration,
                                animationDelay: drop.delay,
                                fontSize: drop.size,
                            }}
                        >
                            {drop.token}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
