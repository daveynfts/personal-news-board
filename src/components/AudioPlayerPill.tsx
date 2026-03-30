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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 4px; /* match the editorial badge rectangular curves or keep it pill shape */
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.4);
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                    overflow: hidden;
                    height: 28px; /* Force small height matching badge */
                }

                .liquid-glass-pill.playing {
                    background: rgba(10, 132, 255, 0.15);
                    border-color: rgba(10, 132, 255, 0.4);
                    box-shadow: 0 4px 16px 0 rgba(10, 132, 255, 0.2), 
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
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.2), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.5);
                }

                .liquid-glass-pill:active {
                    transform: translateY(0);
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .visualizer {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    height: 10px;
                    margin-left: 4px;
                }
                
                .bar {
                    width: 2px;
                    background: var(--accent-color, #0A84FF);
                    border-radius: 1px;
                    animation: bounce 1s ease infinite;
                }
                
                .bar1 { height: 6px; animation-delay: 0.1s; }
                .bar2 { height: 10px; animation-delay: 0.2s; }
                .bar3 { height: 8px; animation-delay: 0.3s; }
                
                @keyframes bounce {
                    0%, 100% { transform: scaleY(0.4); }
                    50% { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
}
