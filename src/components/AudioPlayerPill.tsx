'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { parseSrt, Subtitle } from '@/lib/srtParser';

interface AudioPlayerPillProps {
    url: string;
    subtitleUrl?: string;
    title?: string;
}

export default function AudioPlayerPill({ url, subtitleUrl, title }: AudioPlayerPillProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [widgetVisible, setWidgetVisible] = useState(false);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [volume, setVolume] = useState(1);
    const [position, setPosition] = useState({ x: -1, y: -1 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ mouseX: 0, mouseY: 0, boxX: 0, boxY: 0 });
    const isSeeking = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch SRT
    useEffect(() => {
        if (!subtitleUrl) return;
        const fetchSubtitles = async () => {
            try {
                const proxyUrl = `/api/proxy-srt?url=${encodeURIComponent(subtitleUrl)}`;
                const res = await fetch(proxyUrl);
                if (res.ok) {
                    const text = await res.text();
                    setSubtitles(parseSrt(text));
                }
            } catch (error) {
                console.error("Failed to fetch subtitles:", error);
            }
        };
        fetchSubtitles();
    }, [subtitleUrl]);

    // Sync speed & volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
            audioRef.current.volume = volume;
        }
    }, [speed, volume]);

    // Set default PiP position (bottom-right)
    useEffect(() => {
        if (position.x === -1) {
            setPosition({ x: window.innerWidth - 360, y: window.innerHeight - 420 });
        }
    }, [position.x]);

    // Drag handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, boxX: position.x, boxY: position.y };
    }, [position]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const t = e.touches[0];
        setIsDragging(true);
        dragStart.current = { mouseX: t.clientX, mouseY: t.clientY, boxX: position.x, boxY: position.y };
    }, [position]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.current.mouseX;
        const dy = e.clientY - dragStart.current.mouseY;
        setPosition({
            x: Math.max(0, Math.min(window.innerWidth - 340, dragStart.current.boxX + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 60, dragStart.current.boxY + dy)),
        });
    }, [isDragging]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        const t = e.touches[0];
        const dx = t.clientX - dragStart.current.mouseX;
        const dy = t.clientY - dragStart.current.mouseY;
        setPosition({
            x: Math.max(0, Math.min(window.innerWidth - 340, dragStart.current.boxX + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 60, dragStart.current.boxY + dy)),
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
            if (subtitles.length > 0) setWidgetVisible(true); // Mở widget khi Play
        }
        setIsPlaying(!isPlaying);
    };

    const closeWidget = () => {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
        setWidgetVisible(false);
        setIsMinimized(false);
    };

    const cycleSpeed = () => {
        const rates = [0.75, 1, 1.25, 1.5, 2];
        setSpeed(rates[(rates.indexOf(speed) + 1) % rates.length]);
    };

    const handleSeekDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawTime = parseFloat(e.target.value);
        isSeeking.current = true; // Lock onTimeUpdate
        setCurrentTime(rawTime);  // Update UI instantly
    };

    const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement> | React.PointerEvent<HTMLInputElement>) => {
        const rawTime = parseFloat((e.target as HTMLInputElement).value);
        if (audioRef.current) {
            audioRef.current.currentTime = rawTime;
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = () => {
        if (isSeeking.current) return; // Don't overwrite during seek
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            // Fallback: If duration is missing, grab it during playback
            if (duration === 0 && !isNaN(audioRef.current.duration)) {
                setDuration(audioRef.current.duration);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
        }
    };

    const activeIndex = subtitles.findIndex((s, i) => {
        const isLast = i === subtitles.length - 1;
        return currentTime >= s.startTime && (isLast ? currentTime <= s.endTime : currentTime < s.endTime);
    });

    const getVisibleSubtitles = () => {
        if (!subtitles.length) return [];
        let index = activeIndex !== -1 ? activeIndex : subtitles.findIndex(s => s.startTime > currentTime);
        if (index === -1) index = subtitles.length - 1;
        return [subtitles[index - 1], subtitles[index], subtitles[index + 1]].filter(Boolean) as Subtitle[];
    };

    const visibleSubtitles = getVisibleSubtitles();
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="audio-pill-wrapper">
            {/* Top-level pill button */}
            <div className="player-controls-row">
                <button
                    onClick={togglePlay}
                    className={`liquid-glass-pill ${isPlaying ? 'playing' : ''}`}
                    aria-label={isPlaying ? "Tạm dừng" : "Nghe bài viết"}
                >
                    {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 5.5v13l10-6.5-10-6.5z" /></svg>
                    )}
                    <span>{isPlaying ? 'Đang phát...' : 'Nghe bài viết'}</span>
                    {isPlaying && (
                        <div className="visualizer">
                            <span className="bar bar1"></span>
                            <span className="bar bar2"></span>
                            <span className="bar bar3"></span>
                        </div>
                    )}
                </button>
            </div>

            {/* ── PiP Draggable Widget ── */}
            {widgetVisible && subtitles.length > 0 && (
                <div
                    className={`pip-teleprompter ${isDragging ? 'dragging' : ''} ${isMinimized ? 'minimized' : ''}`}
                    style={{ left: position.x, top: position.y }}
                >
                    {/* Drag Handle */}
                    <div className="pip-drag-handle" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
                        <span className="pip-drag-dots">⠿</span>
                        <span className="pip-title">{title || 'Đang phát'}</span>
                        {/* Minimize button — ẩn box, nhạc vẫn chạy */}
                        <button className="pip-icon-btn" onClick={() => setIsMinimized(true)} title="Thu nhỏ">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="11" width="16" height="2" rx="1"/></svg>
                        </button>
                        {/* Close button — dừng hoàn toàn */}
                        <button className="pip-icon-btn pip-close-btn" onClick={closeWidget} title="Đóng">✕</button>
                    </div>

                    {/* Lyrics */}
                    <div className="pip-content">
                        {visibleSubtitles.map((sub) => {
                            const isLast = sub === subtitles[subtitles.length - 1];
                            const isActive = currentTime >= sub.startTime && (isLast ? currentTime <= sub.endTime : currentTime < sub.endTime);
                            const isPast = isLast ? currentTime > sub.endTime : currentTime >= sub.endTime;
                            return (
                                <p key={sub.id} className={`pip-line ${isActive ? 'active' : isPast ? 'past' : 'future'}`}>
                                    {sub.text}
                                </p>
                            );
                        })}
                    </div>

                    {/* ── Bottom Control Bar ── */}
                    <div className="pip-controls">
                        {/* Seek slider */}
                        <div className="pip-seek-row">
                            <span className="pip-time">{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                className="pip-seek-slider locked"
                                min="0"
                                max={duration || 100}
                                step="0.5"
                                value={currentTime}
                                disabled
                            />
                            <span className="pip-time">{formatTime(duration)}</span>
                        </div>

                        {/* Action row */}
                        <div className="pip-action-row">
                            {/* Play/Pause */}
                            <button className="pip-btn pip-play-btn" onClick={togglePlay} title={isPlaying ? "Tạm dừng" : "Tiếp tục"}>
                                {isPlaying ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 5.5v13l10-6.5-10-6.5z"/></svg>
                                )}
                            </button>

                            {/* Volume */}
                            <div className="pip-volume-group">
                                <button className="pip-btn" onClick={() => setVolume(volume === 0 ? 1 : 0)} title="Tắt tiếng">
                                    {volume === 0 ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    className="pip-vol-slider"
                                    min="0" max="1" step="0.05"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                />
                            </div>

                            {/* Speed */}
                            <button className="pip-btn pip-speed-btn" onClick={cycleSpeed} title="Tốc độ phát">
                                {speed}x
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore bubble khi minimize — nhạc vẫn chạy */}
            {widgetVisible && subtitles.length > 0 && isMinimized && (
                <button
                    className="pip-restore-bubble"
                    style={{ left: position.x, top: position.y }}
                    onClick={() => setIsMinimized(false)}
                    title="Mở rộng"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                    <div className="restore-wave">
                        <span></span><span></span><span></span>
                    </div>
                </button>
            )}

            <audio
                ref={audioRef}
                src={url}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onDurationChange={(e) => {
                    const audio = e.target as HTMLAudioElement;
                    if (!isNaN(audio.duration)) setDuration(audio.duration);
                }}
                onSeeked={() => {
                    isSeeking.current = false;
                    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                }}
                style={{ display: 'none' }}
                title={title || "Article Audio"}
            />

            <style jsx>{`
                .audio-pill-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                .player-controls-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                /* ── Top Pill ── */
                .liquid-glass-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4);
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.25,0.8,0.25,1);
                    position: relative;
                    overflow: hidden;
                    height: 28px;
                }

                .liquid-glass-pill.playing {
                    background: rgba(10,132,255,0.15);
                    border-color: rgba(10,132,255,0.4);
                    box-shadow: 0 4px 16px rgba(10,132,255,0.2), inset 0 1px 0 rgba(255,255,255,0.5);
                }

                .liquid-glass-pill::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%; width: 50%; height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
                    transform: skewX(-20deg);
                    transition: left 0.7s ease;
                }
                .liquid-glass-pill:hover::before { left: 150%; }
                .liquid-glass-pill:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }

                .visualizer { display: flex; align-items: center; gap: 2px; height: 10px; margin-left: 4px; }
                .bar { width: 2px; background: #0A84FF; border-radius: 1px; animation: bounce 1s ease infinite; }
                .bar1 { height: 6px; animation-delay: 0.1s; }
                .bar2 { height: 10px; animation-delay: 0.2s; }
                .bar3 { height: 8px; animation-delay: 0.3s; }
                @keyframes bounce { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }

                /* ══ PiP Teleprompter ══ */
                .pip-teleprompter {
                    position: fixed;
                    z-index: 9999;
                    width: 280px;
                    border-radius: 14px;
                    background: rgba(16, 16, 20, 0.9);
                    backdrop-filter: blur(40px) saturate(200%);
                    -webkit-backdrop-filter: blur(40px) saturate(200%);
                    border: 1px solid rgba(255,255,255,0.12);
                    box-shadow: 0 24px 60px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.14);
                    overflow: hidden;
                    user-select: none;
                    animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
                }

                .pip-teleprompter.dragging {
                    cursor: grabbing !important;
                    transform: scale(1.02);
                    box-shadow: 0 36px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.2);
                }

                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.88) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* Drag Handle */
                .pip-drag-handle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 12px;
                    cursor: grab;
                    background: rgba(255,255,255,0.04);
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }
                .pip-drag-handle:active { cursor: grabbing; }
                .pip-drag-dots { font-size: 1rem; color: rgba(255,255,255,0.25); flex-shrink: 0; }
                .pip-title {
                    flex: 1;
                    font-size: 0.68rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.4);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .pip-close-btn {
                    background: rgba(255,255,255,0.07);
                    border: none;
                    color: rgba(255,255,255,0.45);
                    cursor: pointer;
                    font-size: 0.65rem;
                    width: 20px; height: 20px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .pip-close-btn:hover { background: rgba(255,70,70,0.45); color: #fff; }

                /* Lyrics */
                .pip-content {
                    padding: 14px 14px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    min-height: 100px;
                    justify-content: center;
                }

                .pip-line {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    line-height: 1.45;
                    letter-spacing: -0.02em;
                    transition: all 0.45s cubic-bezier(0.4,0,0.2,1);
                    transform-origin: left center;
                }
                .pip-line.active {
                    color: #fff;
                    transform: scale(1.04);
                    text-shadow: 0 0 20px rgba(255,255,255,0.35);
                }
                .pip-line.past, .pip-line.future {
                    color: rgba(255,255,255,0.2);
                    transform: scale(0.96);
                    filter: blur(0.8px);
                }

                /* ── Bottom Control Bar ── */
                .pip-controls {
                    border-top: 1px solid rgba(255,255,255,0.07);
                    padding: 10px 14px 13px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background: rgba(0,0,0,0.25);
                }

                /* Seek row */
                .pip-seek-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pip-time {
                    font-size: 0.62rem;
                    color: rgba(255,255,255,0.35);
                    font-variant-numeric: tabular-nums;
                    flex-shrink: 0;
                    font-weight: 600;
                }

                .pip-seek-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    height: 3px;
                    border-radius: 3px;
                    background: rgba(255,255,255,0.15);
                    outline: none;
                    cursor: pointer;
                    /* fill left side with accent */
                    background-image: linear-gradient(to right, #0A84FF 0%, #0A84FF ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%);
                    transition: background-image 0.1s;
                }

                .pip-seek-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 12px; height: 12px;
                    border-radius: 50%;
                    background: #fff;
                    cursor: pointer;
                    box-shadow: 0 0 6px rgba(10,132,255,0.8);
                }

                .pip-seek-slider.locked {
                    cursor: default;
                    pointer-events: none;
                }
                .pip-seek-slider.locked::-webkit-slider-thumb {
                    transform: scale(0.8);
                    box-shadow: none;
                    opacity: 0.9;
                }
                .pip-seek-slider::-moz-range-thumb {
                    width: 12px; height: 12px;
                    border-radius: 50%;
                    background: #fff;
                    border: none;
                    cursor: pointer;
                }

                /* Action row */
                .pip-action-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pip-btn {
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.7);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .pip-btn:hover {
                    background: rgba(255,255,255,0.14);
                    color: #fff;
                    transform: translateY(-1px);
                }

                .pip-play-btn {
                    width: 34px; height: 34px;
                    border-radius: 50%;
                    background: rgba(10,132,255,0.25);
                    border-color: rgba(10,132,255,0.5);
                    color: #fff;
                }
                .pip-play-btn:hover {
                    background: rgba(10,132,255,0.5);
                }

                .pip-speed-btn {
                    padding: 0 10px;
                    height: 28px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.03em;
                }

                /* Volume group */
                .pip-volume-group {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pip-volume-group .pip-btn {
                    width: 28px; height: 28px;
                    border-radius: 6px;
                    flex-shrink: 0;
                }

                .pip-vol-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    height: 3px;
                    border-radius: 3px;
                    background: rgba(255,255,255,0.15);
                    outline: none;
                    cursor: pointer;
                }
                .pip-vol-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 11px; height: 11px;
                    border-radius: 50%;
                    background: #fff;
                    cursor: pointer;
                    box-shadow: 0 0 4px rgba(255,255,255,0.6);
                }
                .pip-vol-slider::-moz-range-thumb {
                    width: 11px; height: 11px;
                    border-radius: 50%;
                    background: #fff;
                    border: none;
                }

                /* ── Minimize state — chỉ giỳ thanh Handle, ẩn nội dung — */
                .pip-teleprompter.minimized .pip-content,
                .pip-teleprompter.minimized .pip-controls {
                    display: none;
                }

                .pip-teleprompter.minimized {
                    width: auto;
                    min-width: 160px;
                    border-radius: 30px;
                }

                .pip-teleprompter.minimized .pip-drag-handle {
                    border-radius: 30px;
                    border-bottom: none;
                }

                /* ── Restore Bubble ── */
                .pip-restore-bubble {
                    position: fixed;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 50px;
                    background: rgba(10, 132, 255, 0.2);
                    backdrop-filter: blur(30px);
                    -webkit-backdrop-filter: blur(30px);
                    border: 1px solid rgba(10, 132, 255, 0.45);
                    box-shadow: 0 8px 32px rgba(10, 132, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
                    color: #fff;
                    cursor: pointer;
                    animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .pip-restore-bubble:hover {
                    transform: scale(1.06);
                    box-shadow: 0 12px 40px rgba(10, 132, 255, 0.45);
                }

                .restore-wave {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    height: 12px;
                }

                .restore-wave span {
                    display: block;
                    width: 2px;
                    border-radius: 2px;
                    background: rgba(255,255,255,0.7);
                    animation: restoreBounce 0.9s ease infinite;
                }
                .restore-wave span:nth-child(1) { height: 6px; animation-delay: 0s; }
                .restore-wave span:nth-child(2) { height: 12px; animation-delay: 0.15s; }
                .restore-wave span:nth-child(3) { height: 8px; animation-delay: 0.3s; }

                @keyframes restoreBounce {
                    0%,100% { transform: scaleY(0.4); }
                    50% { transform: scaleY(1); }
                }

                /* ── Icon Buttons (minimize + close) in handle ── */
                .pip-icon-btn {
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.5);
                    border-radius: 6px;
                    cursor: pointer;
                    width: 22px; height: 22px;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                    font-size: 0.7rem;
                    padding: 0;
                }
                .pip-icon-btn:hover { background: rgba(255,255,255,0.16); color: #fff; }
                .pip-close-btn:hover { background: rgba(255,70,70,0.45) !important; color: #fff !important; }

                @media (max-width: 480px) {
                    .pip-teleprompter { width: 260px; }
                    .pip-line { font-size: 0.85rem; }
                }
            `}</style>
        </div>
    );
}
