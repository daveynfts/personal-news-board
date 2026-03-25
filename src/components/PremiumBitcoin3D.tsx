'use client';

import { useEffect, useRef } from 'react';

interface PremiumBitcoin3DProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  intensity?: number;
}

/**
 * Premium Gold Bronze Bitcoin Coin
 * 
 * Material: Gold Bronze PBR — low roughness, metallic reflections
 * Details: Micro-etched circuit patterns, Web3 network rings, micro text
 * Lighting: Multi-point area lights with specular catch points
 * Motion: Physical easing — weighted rotation with inertia
 */
export default function PremiumBitcoin3D({ 
  size = 120, 
  intensity = 0, 
  className = '', 
  style = {},
  ...props 
}: PremiumBitcoin3DProps) {
  const coinRef = useRef<HTMLDivElement>(null);
  const thickness = size * 0.08;
  const edgeLayers = 14;
  const layerStep = thickness / edgeLayers;

  // Gentle float with subtle micro-wobble
  useEffect(() => {
    const coin = coinRef.current;
    if (!coin) return;
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.006;
      const y = Math.sin(t) * 3.5;
      const rx = Math.sin(t * 0.7) * 0.5; // micro-wobble
      coin.style.setProperty('--float-y', `${y}px`);
      coin.style.setProperty('--wobble', `${rx}deg`);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={coinRef}
      className={`gold-coin ${className}`}
      style={{
        '--coin-size': `${size}px`,
        '--coin-speed': `${10 - intensity * 4}s`,
        ...style
      } as React.CSSProperties}
      {...props}
    >
      {/* Area lights and contact shadow removed to ensure a perfectly clean 3D floating look with zero background glow */}

      {/* The coin */}
      <div className="gold-coin__scene">
        <div className="gold-coin__body">

          {/* ── Front face ── */}
          <div
            className="gold-coin__face gold-coin__front"
            style={{ transform: `translateZ(${thickness / 2}px)` }}
          >
            {/* Gold bronze metallic surface */}
            <div className="gold-coin__metal" />

            {/* Micro-etching SVG — circuit pattern + Web3 details */}
            <svg className="gold-coin__etch" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="etchGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(255,220,140,0.3)" />
                  <stop offset="100%" stopColor="rgba(180,120,40,0.15)" />
                </linearGradient>
              </defs>
              {/* Outer ring with tick marks */}
              <circle cx="100" cy="100" r="92" fill="none" stroke="url(#etchGrad)" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="88" fill="none" stroke="url(#etchGrad)" strokeWidth="0.3" strokeDasharray="2 6" />
              {/* Inner concentric rings */}
              <circle cx="100" cy="100" r="78" fill="none" stroke="url(#etchGrad)" strokeWidth="0.4" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="url(#etchGrad)" strokeWidth="0.25" strokeDasharray="1.5 4" />
              {/* Circuit traces — Web3 network pattern */}
              <path d="M100 22 L100 32 M100 168 L100 178 M22 100 L32 100 M168 100 L178 100" stroke="url(#etchGrad)" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M45 45 L55 55 M145 45 L155 55 M45 145 L55 155 M145 145 L155 155" stroke="url(#etchGrad)" strokeWidth="0.4" strokeLinecap="round" />
              {/* Network nodes */}
              <circle cx="100" cy="28" r="1.5" fill="rgba(255,215,100,0.25)" />
              <circle cx="100" cy="172" r="1.5" fill="rgba(255,215,100,0.25)" />
              <circle cx="28" cy="100" r="1.5" fill="rgba(255,215,100,0.25)" />
              <circle cx="172" cy="100" r="1.5" fill="rgba(255,215,100,0.25)" />
              {/* Inner detail ring with micro text simulation */}
              <circle cx="100" cy="100" r="62" fill="none" stroke="url(#etchGrad)" strokeWidth="0.3" />
              {/* Micro text arc — "DECENTRALIZED • PEER-TO-PEER • DIGITAL GOLD •" */}
              <path id="textArc" d="M 100,100 m -56,0 a 56,56 0 1,1 112,0 a 56,56 0 1,1 -112,0" fill="none" />
              <text fontSize="3.2" fill="rgba(255,210,120,0.18)" letterSpacing="1.8" fontFamily="monospace">
                <textPath href="#textArc" startOffset="0%">DECENTRALIZED • PEER-TO-PEER • DIGITAL GOLD • SATOSHI •</textPath>
              </text>
              {/* Inner decorative ring */}
              <circle cx="100" cy="100" r="42" fill="none" stroke="url(#etchGrad)" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="39" fill="none" stroke="url(#etchGrad)" strokeWidth="0.2" strokeDasharray="3 3" />
            </svg>

            {/* Bitcoin ₿ symbol — embossed gold */}
            <span className="gold-coin__btc">₿</span>

            {/* Specular catch points — simulating area lights reflecting off metal */}
            <div className="gold-coin__specular gold-coin__specular--key" />
            <div className="gold-coin__specular gold-coin__specular--fill" />
            <div className="gold-coin__specular gold-coin__specular--accent" />
          </div>

          {/* ── Back face ── */}
          <div
            className="gold-coin__face gold-coin__back"
            style={{ transform: `rotateY(180deg) translateZ(${thickness / 2}px)` }}
          >
            <div className="gold-coin__metal" />
            <svg className="gold-coin__etch" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="etchGradB" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(255,220,140,0.3)" />
                  <stop offset="100%" stopColor="rgba(180,120,40,0.15)" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="92" fill="none" stroke="url(#etchGradB)" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="88" fill="none" stroke="url(#etchGradB)" strokeWidth="0.3" strokeDasharray="2 6" />
              <circle cx="100" cy="100" r="78" fill="none" stroke="url(#etchGradB)" strokeWidth="0.4" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="url(#etchGradB)" strokeWidth="0.3" />
              <circle cx="100" cy="100" r="42" fill="none" stroke="url(#etchGradB)" strokeWidth="0.5" />
              <path d="M100 22 L100 32 M100 168 L100 178 M22 100 L32 100 M168 100 L178 100" stroke="url(#etchGradB)" strokeWidth="0.6" strokeLinecap="round" />
            </svg>
            <span className="gold-coin__btc">₿</span>
            <div className="gold-coin__specular gold-coin__specular--key" />
            <div className="gold-coin__specular gold-coin__specular--fill" />
          </div>

          {/* ── Edge — polished bronze with milled grooves ── */}
          {Array.from({ length: edgeLayers }).map((_, i) => {
            const z = -thickness / 2 + i * layerStep;
            return (
              <div
                key={i}
                className="gold-coin__edge"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: `translateZ(${z}px)`,
                }}
              />
            );
          })}

        </div>
      </div>
    </div>
  );
}
