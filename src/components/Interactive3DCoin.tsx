'use client';

import { useState, useRef, MouseEvent } from 'react';

export default function Interactive3DCoin() {
  const coinRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!coinRef.current) return;
    const rect = coinRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top; // y position within the element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -30; // Max rotation 30deg
    const rotateY = ((x - centerX) / centerX) * 30;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 }); // Reset to flat
  };

  return (
    <div 
      className="so-interactive-coin-container"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={coinRef}
        className={`so-glass-coin ${!isHovering ? 'so-coin-idle' : ''}`}
        style={{
          transform: isHovering ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : undefined
        }}
      >
        {/* Core Glass Body */}
        <div className="so-coin-face so-coin-front">
          <div className="so-coin-glow-lines" />
          <span className="so-coin-symbol">₿</span>
        </div>
        
        {/* Inner Depth Layers (creates the physical thickness effect) */}
        <div className="so-coin-layer" style={{ transform: 'translateZ(-4px)' }} />
        <div className="so-coin-layer" style={{ transform: 'translateZ(-8px)' }} />
        <div className="so-coin-layer" style={{ transform: 'translateZ(-12px)' }} />
        <div className="so-coin-layer" style={{ transform: 'translateZ(-16px)' }} />
        <div className="so-coin-layer" style={{ transform: 'translateZ(-20px)' }} />
        
        {/* Outer Glass Ring */}
        <div className="so-coin-rim" />

        <div className="so-coin-face so-coin-back">
          <div className="so-coin-glow-lines" />
          <span className="so-coin-symbol">₿</span>
        </div>
      </div>
    </div>
  );
}
