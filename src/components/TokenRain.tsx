'use client';

import { useState, useMemo } from 'react';

const TOKENS = ['₿', 'Ξ', '🌕', '🚀', '💎', '📈', '🪙', '💸', '💰', '🔥'];

// Pre-generate fixed drop configs; randomness is locked at module load to avoid re-renders
const DROP_CONFIGS = Array.from({ length: 45 }).map((_, i) => ({
    id: i,
    token: TOKENS[Math.floor(Math.random() * TOKENS.length)],
    left: `${Math.random() * 100}vw`,
    duration: `${Math.random() * 4 + 4}s`,
    delay: `${Math.random() * 5}s`,
    size: `${Math.random() * 1.5 + 1}rem`,
}));

export default function TokenRain() {
    const [isRaining, setIsRaining] = useState(false);

    const drops = useMemo(() => (isRaining ? DROP_CONFIGS : []), [isRaining]);

    return (
        <>
            {/* Floating Toggle Button — BTC Liquid Glass */}
            <button
                onClick={() => setIsRaining(!isRaining)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    zIndex: 9999,
                    background: isRaining 
                      ? 'linear-gradient(135deg, rgba(247,147,26,0.9) 0%, rgba(255,200,50,0.85) 100%)' 
                      : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                    color: isRaining ? '#000' : 'rgba(255, 255, 255, 0.9)',
                    border: `1.5px solid ${isRaining ? 'rgba(247,147,26,0.8)' : 'rgba(255, 255, 255, 0.18)'}`,
                    borderTopColor: isRaining ? 'rgba(255,220,100,0.9)' : 'rgba(255,255,255,0.35)',
                    padding: '12px',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: isRaining 
                      ? '0 0 30px rgba(247,147,26,0.5), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.4)' 
                      : '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 1px rgba(255,255,255,0.15)',
                    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    backdropFilter: 'blur(24px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                    letterSpacing: '-0.02em',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
                title={isRaining ? "Stop the Rain" : "Make it Rain Tokens!"}
            >
                ₿
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
