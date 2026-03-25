'use client';

import React, { useMemo } from 'react';

export default function LiquidPiggyBank({ intensity, className = '', style = {} }: { intensity: number, className?: string, style?: React.CSSProperties }) {
  
  // Create 150 bundles of cash that stack up organically inside the sphere
  const numBills = 150;
  const activeBills = Math.floor(intensity * numBills);
  
  const billsData = useMemo(() => {
    const arr = [];
    const r = 70; // The inner radius where money can fall
    for(let i=0; i<numBills; i++) {
        // Distribute Y mostly at bottom
        const yP = Math.pow(Math.random(), 0.6); 
        const y = 25 + yP * 125; // 25 (highest pile) to 150 (bottom)
        
        const dy = y - 80;
        let dxSpan = Math.sqrt(Math.max(0, r*r - dy*dy));
        dxSpan = Math.max(0, dxSpan - 18); // bill width padding (18 is half of 36)
        
        let xOffset = (Math.random() * 2 - 1) * dxSpan;
        // Bias center slightly
        xOffset = xOffset * (0.8 + Math.random() * 0.2); 
        const x = 80 + xOffset - 18; 

        // Scatter rotations
        arr.push({ x, y, rot: (Math.random() - 0.5) * 160, delay: Math.random() * 0.2 });
    }
    // Highest Y is technically the lowest visual point on screen. 
    // Wait, we WANT lowest Y (top of screen) to render LAST so they stack ON TOP of others in CSS z-index!
    arr.sort((a,b) => b.y - a.y);
    return arr;
  }, []);

  return (
    <div 
      className={`relative flex items-center justify-center ${className} select-none`}
      style={{
        width: '160px',
        height: '160px',
        ...style
      }}
    >
      {/* Global CSS animations that do not unmount to prevent layout shifts */}
      <style>{`
        @keyframes squidMoneyDrop {
           0% { transform: translate(62px, -60px) rotate(15deg); opacity: 0; }
           20% { opacity: 1; transform: translate(62px, -10px) rotate(5deg); }
           80% { opacity: 1; transform: translate(64px, 90px) rotate(-45deg); }
           100% { transform: translate(64px, 120px) rotate(-65deg); opacity: 0; }
        }
      `}</style>

      {/* Intense Golden Glow radiating behind the pig to match the reference lighting */}
      <div 
        className="absolute w-[180px] h-[180px] rounded-full blur-[32px] transition-all duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(250,204,21,${0.3 + intensity * 0.4}) 0%, rgba(251,146,60,${0.1 + intensity * 0.2}) 50%, transparent 70%)`
        }} 
      />

      <div className="relative w-[160px] h-[160px] z-10">
         
         {/* EARS (Tiny Glass Tabs) */}
         <div className="absolute -top-[8px] left-[35px] w-[24px] h-[18px] bg-yellow-300/40 backdrop-blur-md rounded-t-full border-[2px] border-yellow-200/80 -rotate-[25deg] shadow-inner z-0" />
         <div className="absolute -top-[8px] right-[35px] w-[24px] h-[18px] bg-yellow-300/40 backdrop-blur-md rounded-t-full border-[2px] border-yellow-200/80 rotate-[25deg] shadow-inner z-0" />

         {/* LEGS (Tiny Glass Nubbins at the bottom) */}
         <div className="absolute -bottom-[6px] left-[40px] w-[24px] h-[16px] bg-gradient-to-b from-yellow-500/50 to-orange-600/30 backdrop-blur-md border-[2px] border-yellow-300/50 rounded-b-xl -rotate-[15deg] origin-top z-0" />
         <div className="absolute -bottom-[6px] right-[40px] w-[24px] h-[16px] bg-gradient-to-b from-yellow-500/50 to-orange-600/30 backdrop-blur-md border-[2px] border-yellow-300/50 rounded-b-xl rotate-[15deg] origin-top z-0" />

         {/* THE MAIN SQUID GAME VAULT: Photorealistic Perfect Glass Sphere */}
         <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-100/10 via-yellow-500/30 to-amber-700/50 overflow-hidden shadow-[inset_0_-20px_40px_rgba(234,179,8,0.7),_inset_0_20px_40px_rgba(255,255,255,0.9),_0_20px_50px_rgba(0,0,0,0.8),_inset_0_0_25px_rgba(251,191,36,0.9)] border-[2px] border-t-white/90 border-r-yellow-200/80 border-l-yellow-100/60 border-b-orange-500/50 z-20 backdrop-blur-md">
             
             {/* Studio Light Top Arc Flare (From the Reference Image) */}
             <div className="absolute top-[2px] left-[50%] -translate-x-[50%] w-[85%] h-[35px] bg-white/70 blur-[4px] rounded-[50%]" 
                  style={{ clipPath: 'ellipse(50% 30% at 50% 20%)', WebkitClipPath: 'ellipse(50% 30% at 50% 20%)' }} />
             
             {/* Glare Dots (Right & Left) */}
             <div className="absolute top-[30px] right-[10px] w-[14px] h-[14px] bg-white/95 blur-[2px] rounded-full shadow-[0_0_12px_white]" />
             <div className="absolute top-[50px] left-[6px] w-[10px] h-[40px] border-l-[6px] border-white/60 blur-[3px] rounded-full border-solid" />

             {/* BUNDLES OF CASH (Green Bills + Yellow Bands filling the sphere) */}
             {billsData.map((b, index) => {
                 const active = index < activeBills;
                 // Dynamic dropping animation: If inactive, suspended high above the sphere
                 const dropY = active ? b.y : -80; 
                 
                 return (
                   <div 
                      key={index}
                      className="absolute w-[36px] h-[15px] rounded-[1px] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_3px_5px_rgba(0,0,0,0.6)] z-10"
                      style={{
                         backgroundColor: '#65a30d', // Olive/Green USA Dollar Bills 
                         border: '1px solid #3f6212', 
                         transform: `translate(${b.x}px, ${dropY}px) rotate(${b.rot}deg)`,
                         opacity: active ? 1 : 0,
                         transition: `transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${b.delay}s, opacity 0.2s ease-out ${b.delay}s`,
                      }}
                   >
                      <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_3px)] rounded-sm" />
                      {/* Golden Wrapping Band around cash */}
                      <div className="w-[10px] h-full bg-yellow-400 border-x border-yellow-600 shadow-[0_0_2px_rgba(0,0,0,0.7)] z-20 flex items-center justify-center relative overflow-hidden" />
                   </div>
                 )
             })}
             
             {/* Dynamic Endless Dropping Bill Effect Loop For Intense Volume */}
             {intensity > 0.05 && intensity < 1 && (
                <div 
                  className="absolute w-[36px] h-[15px] rounded-[1px] flex items-center justify-center overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.6)] border border-[#3f6212] z-20"
                  style={{
                     backgroundColor: '#65a30d',
                     animation: `squidMoneyDrop ${0.9 - intensity * 0.4}s cubic-bezier(0.5, 0, 1, 1) infinite`,
                  }}
                >
                   <div className="w-[10px] h-full bg-yellow-400 border-x border-yellow-600 shadow-[0_0_2px_rgba(0,0,0,0.7)] z-10" />
                </div>
             )}
         </div>

         {/* THE MASSIVE CENTERED SNOUT & FACE (Z-30 so it floats perfectly in front of the cash) */}
         <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
             
             {/* Happy Curved Chevrons (Eyes) */}
             <div className="flex w-full px-[36px] justify-between mt-[-10px] z-30">
                 {/* Left Eye */}
                 <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#3f2a13] drop-shadow-[0_3px_5px_rgba(255,255,255,0.7)]">
                    <path d="M 2 16 Q 12 2, 22 16" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                 </svg>
                 {/* Right Eye */}
                 <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#3f2a13] drop-shadow-[0_3px_5px_rgba(255,255,255,0.7)]">
                    <path d="M 2 16 Q 12 2, 22 16" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                 </svg>
             </div>
             
             {/* The Squid Game Legendary Snout */}
             <div className="w-[72px] h-[72px] mt-[8px] rounded-[50%] bg-gradient-to-tr from-yellow-300/50 to-amber-100/90 backdrop-blur-xl shadow-[0_15px_30px_rgba(180,83,9,0.5),_inset_0_5px_15px_rgba(255,255,255,0.9)] border-[2.5px] border-yellow-100/90 flex items-center justify-center relative gap-[14px]">
                 {/* Nostril 1 */}
                 <div className="w-[12px] h-[22px] bg-[#3f2a13] rounded-[50%] shadow-[inset_0_5px_10px_rgba(0,0,0,0.9),_0_2px_4px_rgba(255,255,255,0.8)]" />
                 {/* Nostril 2 */}
                 <div className="w-[12px] h-[22px] bg-[#3f2a13] rounded-[50%] shadow-[inset_0_5px_10px_rgba(0,0,0,0.9),_0_2px_4px_rgba(255,255,255,0.8)]" />
                 {/* Shiny snout reflection top curve */}
                 <div className="absolute top-[2px] left-1/2 -translate-x-[50%] w-[50px] h-[15px] bg-white/70 blur-[2px] rounded-[50%]" />
             </div>

             {/* Glass Cheek Blushes for 3D Cutness */}
             <div className="absolute top-[75px] left-[15px] w-[18px] h-[18px] bg-white/30 rounded-[50%] blur-[1px] border border-white/40 shadow-[0_2px_5px_rgba(0,0,0,0.1)]" />
             <div className="absolute top-[75px] right-[15px] w-[18px] h-[18px] bg-white/30 rounded-[50%] blur-[1px] border border-white/40 shadow-[0_2px_5px_rgba(0,0,0,0.1)]" />
         </div>

      </div>
    </div>
  )
}
