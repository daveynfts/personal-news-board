'use client';
import { useEffect, useState, useRef } from 'react';
import type { TocHeading } from '@/lib/stringUtils';

interface Props {
    headings: TocHeading[];
}

export default function TableOfContents({ headings }: Props) {
    const [activeId, setActiveId] = useState<string>('');
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const handleObserver = (entries: IntersectionObserverEntry[]) => {
            // Find all intersecting elements
            const intersecting = entries.filter(e => e.isIntersecting);
            if (intersecting.length > 0) {
                // If multiple are intersecting, pick the first one
                setActiveId(intersecting[0].target.id);
            }
        };

        observer.current = new IntersectionObserver(handleObserver, {
            rootMargin: '-15% 0px -40% 0px',
        });

        // Observe elements shortly after mount to allow DOM rendering
        setTimeout(() => {
            headings.forEach((heading) => {
                const element = document.getElementById(heading.id);
                if (element) {
                    observer.current?.observe(element);
                }
            });
        }, 100);

        return () => observer.current?.disconnect();
    }, [headings]);

    if (!headings || headings.length === 0) return null;

    return (
        <nav className="toc-container">
            <h4 className="toc-title">Mục lục Nội dung</h4>
            <div className="toc-line-wrapper">
                <div className="toc-line"></div>
                <ul className="toc-list">
                    {headings.map((heading) => {
                        const isActive = activeId === heading.id;
                        return (
                            <li key={heading.id} className={`toc-item toc-level-${heading.level}`}>
                                <a
                                    href={`#${heading.id}`}
                                    className={`toc-link ${isActive ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const el = document.getElementById(heading.id);
                                        if (el) {
                                            const y = el.getBoundingClientRect().top + window.scrollY - 80; // offset for sticky header
                                            window.scrollTo({ top: y, behavior: 'smooth' });
                                        }
                                        setActiveId(heading.id);
                                    }}
                                >
                                    {heading.text}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .toc-container {
                    position: sticky;
                    top: 100px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 24px;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    max-height: calc(100vh - 120px);
                    overflow-y: auto;
                }
                
                /* Custom scrollbar for TOC */
                .toc-container::-webkit-scrollbar {
                    width: 4px;
                }
                .toc-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                
                .toc-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin: 0 0 16px 0;
                    color: #fff;
                    letter-spacing: 0.5px;
                }
                
                .toc-line-wrapper {
                    position: relative;
                }
                
                .toc-line {
                    position: absolute;
                    left: 2px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 2px;
                }
                
                .toc-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    position: relative;
                }
                
                .toc-item {
                    margin-bottom: 12px;
                    line-height: 1.4;
                }
                
                .toc-item:last-child {
                    margin-bottom: 0;
                }
                
                .toc-level-2 {
                    padding-left: 16px;
                }
                
                .toc-level-3 {
                    padding-left: 32px;
                    font-size: 0.9em;
                }
                
                .toc-link {
                    color: rgba(255, 255, 255, 0.5);
                    text-decoration: none;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    display: block;
                    position: relative;
                }
                
                .toc-link:hover {
                    color: rgba(255, 255, 255, 0.9);
                }
                
                .toc-link.active {
                    color: var(--accent-color, #0A84FF);
                    font-weight: 600;
                }
                
                /* The indicator dot */
                .toc-link::before {
                    content: '';
                    position: absolute;
                    left: -16px;
                    top: 50%;
                    transform: translateY(-50%) scale(0.5);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--accent-color, #0A84FF);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                
                .toc-level-3 .toc-link::before {
                    left: -32px;
                }
                
                .toc-link.active::before {
                    opacity: 1;
                    transform: translateY(-50%) scale(1);
                    box-shadow: 0 0 8px var(--accent-color, #0A84FF);
                }
            `}} />
        </nav>
    );
}
