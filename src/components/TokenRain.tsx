'use client';

import { useState, useMemo } from 'react';

/* ── Token Definitions ── */
interface TokenDef {
    symbol: string;
    color: string;       // primary brand color
    bgGradient: string;  // liquid glass gradient
    glowColor: string;   // outer glow
}

const TOKEN_DEFS: TokenDef[] = [
    {
        symbol: '₿',
        color: '#F7931A',
        bgGradient: 'linear-gradient(135deg, rgba(247,147,26,0.25) 0%, rgba(247,147,26,0.08) 100%)',
        glowColor: 'rgba(247,147,26,0.6)',
    },
    {
        symbol: 'Ξ',
        color: '#627EEA',
        bgGradient: 'linear-gradient(135deg, rgba(98,126,234,0.25) 0%, rgba(98,126,234,0.08) 100%)',
        glowColor: 'rgba(98,126,234,0.6)',
    },
    {
        symbol: 'BNB',
        color: '#F0B90B',
        bgGradient: 'linear-gradient(135deg, rgba(240,185,11,0.25) 0%, rgba(240,185,11,0.08) 100%)',
        glowColor: 'rgba(240,185,11,0.6)',
    },
    {
        symbol: '₮',
        color: '#26A17B',
        bgGradient: 'linear-gradient(135deg, rgba(38,161,123,0.25) 0%, rgba(38,161,123,0.08) 100%)',
        glowColor: 'rgba(38,161,123,0.6)',
    },
    {
        symbol: '$',
        color: '#2775CA',
        bgGradient: 'linear-gradient(135deg, rgba(39,117,202,0.25) 0%, rgba(39,117,202,0.08) 100%)',
        glowColor: 'rgba(39,117,202,0.6)',
    },
];

// Pre-generate fixed drop configs at module load
const DROP_CONFIGS = Array.from({ length: 35 }).map((_, i) => {
    const token = TOKEN_DEFS[Math.floor(Math.random() * TOKEN_DEFS.length)];
    const baseSize = 28 + Math.random() * 20; // 28-48px
    return {
        id: i,
        token,
        left: `${Math.random() * 100}vw`,
        duration: `${Math.random() * 5 + 5}s`,     // 5-10s
        delay: `${Math.random() * 6}s`,
        size: baseSize,
        rotation: Math.random() * 360,
        wobble: Math.random() > 0.5,
    };
});

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
                            className={`falling-token ${drop.wobble ? 'wobble' : ''}`}
                            style={{
                                left: drop.left,
                                animationDuration: drop.duration,
                                animationDelay: drop.delay,
                                '--token-color': drop.token.color,
                                '--token-glow': drop.token.glowColor,
                            } as React.CSSProperties}
                        >
                            <div
                                className="token-coin"
                                style={{
                                    width: `${drop.size}px`,
                                    height: `${drop.size}px`,
                                    background: drop.token.bgGradient,
                                    borderColor: `${drop.token.color}40`,
                                    borderTopColor: `${drop.token.color}80`,
                                    fontSize: drop.token.symbol.length > 1 
                                        ? `${drop.size * 0.32}px` 
                                        : `${drop.size * 0.48}px`,
                                    color: drop.token.color,
                                }}
                            >
                                {drop.token.symbol}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
