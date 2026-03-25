'use client';

import React from 'react';

export default function LiquidChart({ intensity, className = '', style = {} }: { intensity: number, className?: string, style?: React.CSSProperties }) {
  // We'll generate a few candlesticks (mostly green to stimulate trading/profit).
  const candles = [
    { x: 12, y: 65, h: 20, isUp: true },
    { x: 30, y: 55, h: 25, isUp: true },
    { x: 48, y: 65, h: 10, isUp: false },
    { x: 66, y: 35, h: 30, isUp: true },
    { x: 84, y: 15, h: 35, isUp: true },
  ];

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: '130px',
        height: '130px',
        ...style
      }}
    >
      {/* Massive Neon Glow Behind Screen */}
      <div 
        className="absolute inset-0 rounded-3xl blur-2xl transition-all duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(16,185,129,${0.3 + intensity * 0.5}) 0%, transparent 80%)`,
          transform: `scale(${1.2 + intensity * 0.6})`
        }} 
      />
      
      {/* Liquid Glass Monitor */}
      <div 
        className="relative w-full h-full rounded-2xl flex items-end overflow-hidden bg-black/40"
        style={{
          border: `1px solid rgba(255,255,255,${0.2 + intensity * 0.2})`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -15px 30px rgba(16,185,129,${0.15 + intensity * 0.3}), 0 10px 40px rgba(0,0,0,0.8)`
        }}
      >
        {/* Screen Reflection */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white to-transparent opacity-[0.06] pointer-events-none scale-110 -translate-y-2 origin-top"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 50%)' }}
        />

        {/* The Candlestick Chart SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-2 overflow-visible">
          {candles.map((c, i) => {
            const color = c.isUp ? '#10b981' : '#ef4444';
            const shadowColor = c.isUp ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)';
            const animName = `candleBounce${i}`;
            return (
              <g key={i} style={{ animation: `${animName} ${1 + (Math.random() * 0.5) - intensity * 0.3}s infinite alternate ease-in-out` }}>
                <style>{`
                  @keyframes ${animName} {
                    0% { transform: translateY(${Math.random() * 5}px); }
                    100% { transform: translateY(-${15 + intensity * 15}px); }
                  }
                `}</style>
                {/* Wick */}
                <line 
                  x1={c.x} y1={c.y - 10} x2={c.x} y2={c.y + c.h + 10} 
                  stroke={color} strokeWidth="1.5" 
                  style={{ filter: `drop-shadow(0 0 4px ${shadowColor})` }}
                />
                {/* Body */}
                <rect 
                  x={c.x - 4} y={c.y} width="8" height={c.h} rx="2" 
                  fill={color} 
                  style={{ filter: `drop-shadow(0 0 ${4 + intensity * 8}px ${shadowColor})` }}
                />
              </g>
            );
          })}
          
          {/* Dynamic "To the moon" Arrow Line connecting the candles */}
          <path 
            d="M 5 80 L 25 60 L 45 70 L 65 40 L 95 10" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="3" 
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ 
              filter: `drop-shadow(0 0 ${8 + intensity * 12}px #10b981)`,
              animation: `moonPath ${1.5 - intensity * 0.5}s infinite alternate ease-in-out` 
            }} 
          />
          <style>{`
            @keyframes moonPath {
              0% { transform: translateY(0) scaleY(1); opacity: 0.8;}
              100% { transform: translateY(-${15 + intensity * 15}px) scaleY(${1 + intensity * 0.2}); opacity: 1;}
            }
          `}</style>
        </svg>

        {/* Small UI overlay simulating a trading terminal */}
        <div className="absolute top-2 left-2 flex gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
        </div>
      </div>

       {/* Monitor Stand */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-3 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md rounded-b-md border border-white/10 border-t-0 shadow-lg" />
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
    </div>
  )
}
