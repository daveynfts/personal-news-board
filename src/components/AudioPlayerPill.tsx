'use client';

import { useState, useRef } from 'react';

export default function AudioPlayerPill({ url, title }: { url: string; title?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="audio-pill-container" style={{ margin: '20px 0' }}>
            <button 
                onClick={togglePlay}
                className={`liquid-glass-pill ${isPlaying ? 'playing' : ''}`}
                aria-label={isPlaying ? "Tạm dừng" : "Nghe bài viết"}
            >
                {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.5 5.5v13l10-6.5-10-6.5z" />
                    </svg>
                )}
                <span>{isPlaying ? 'Đang phát...' : 'Nghe bài viết'}</span>
                
                {/* Audio visualizer effect */}
                {isPlaying && (
                    <div className="visualizer">
                        <span className="bar bar1"></span>
                        <span className="bar bar2"></span>
                        <span className="bar bar3"></span>
                    </div>
                )}
            </button>

            <audio 
                ref={audioRef} 
                src={url} 
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
                title={title || "Article Audio"}
            />

            <style jsx>{`
                .liquid-glass-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 28px;
                    border-radius: 50px;
                    background: rgba(255, 255, 255, 0.08); /* Frosted glass base */
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15); /* Sleek outline */
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.4); /* Liquid shine */
                    color: #fff;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                    overflow: hidden;
                }

                .liquid-glass-pill.playing {
                    background: rgba(10, 132, 255, 0.15); /* Subtle blue tint when playing */
                    border-color: rgba(10, 132, 255, 0.4);
                    box-shadow: 0 8px 32px 0 rgba(10, 132, 255, 0.2), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.5);
                }

                .liquid-glass-pill::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%; width: 50%; height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
                    transform: skewX(-20deg);
                    transition: all 0.7s ease;
                }

                .liquid-glass-pill:hover::before {
                    left: 150%;
                }

                .liquid-glass-pill:hover {
                    background: rgba(255, 255, 255, 0.12);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.25), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.5);
                }

                .liquid-glass-pill:active {
                    transform: translateY(0);
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .visualizer {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    height: 16px;
                    margin-left: 8px;
                }
                
                .bar {
                    width: 3px;
                    background: var(--accent-color, #0A84FF);
                    border-radius: 2px;
                    animation: bounce 1s ease infinite;
                }
                
                .bar1 { height: 8px; animation-delay: 0.1s; }
                .bar2 { height: 16px; animation-delay: 0.2s; }
                .bar3 { height: 10px; animation-delay: 0.3s; }
                
                @keyframes bounce {
                    0%, 100% { transform: scaleY(0.5); }
                    50% { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
}
