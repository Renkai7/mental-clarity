'use client';

/**
 * BackgroundEffects Component
 * 
 * Cinematic background effects for Ember UI.
 * Includes grid overlay, pulsing glows, floating orbs, and shooting stars.
 * Creates a meteor shower effect moving diagonally (5 o'clock direction).
 */
export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(255 255 255 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(255 255 255 / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Radial gradient glow spots for depth (stationary) */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-30 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, oklch(0.70 0.20 45 / 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-20 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, oklch(0.73 0.18 60 / 0.25) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animationDelay: '1s',
        }}
      />
      
      {/* Shooting Stars - meteor shower effect */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[3px] h-[40px] bg-gradient-to-b from-lumina-orange-400 to-transparent opacity-40 animate-shooting-star"
        style={{ filter: 'blur(1px)' }}
      />
      <div 
        className="absolute -top-[5%] -left-[5%] w-[2px] h-[30px] bg-gradient-to-b from-lumina-amber-400 to-transparent opacity-30 animate-shooting-star"
        style={{ filter: 'blur(1px)', animationDelay: '0.5s' }}
      />
      <div 
        className="absolute top-[10%] -left-[15%] w-[3px] h-[35px] bg-gradient-to-b from-lumina-orange-500 to-transparent opacity-35 animate-shooting-star"
        style={{ filter: 'blur(1px)', animationDelay: '1.2s' }}
      />
      <div 
        className="absolute top-0 left-[20%] w-[2px] h-[25px] bg-gradient-to-b from-lumina-amber-500 to-transparent opacity-25 animate-shooting-star"
        style={{ filter: 'blur(1px)', animationDelay: '2s' }}
      />
      <div 
        className="absolute -top-[8%] left-[10%] w-[3px] h-[32px] bg-gradient-to-b from-lumina-orange-400 to-transparent opacity-30 animate-shooting-star"
        style={{ filter: 'blur(1px)', animationDelay: '3s' }}
      />
      
      {/* Drifting Light Orbs - continuous diagonal movement */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[120px] h-[120px] opacity-10 animate-drift-orb"
        style={{
          background: 'radial-gradient(circle, oklch(0.70 0.20 45 / 0.5) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      <div 
        className="absolute -top-[5%] left-[30%] w-[100px] h-[100px] opacity-8 animate-drift-orb"
        style={{
          background: 'radial-gradient(circle, oklch(0.73 0.18 60 / 0.45) 0%, transparent 70%)',
          filter: 'blur(35px)',
          animationDelay: '5s',
        }}
      />
      <div 
        className="absolute top-[10%] -left-[20%] w-[90px] h-[90px] opacity-7 animate-drift-orb"
        style={{
          background: 'radial-gradient(circle, oklch(0.70 0.20 45 / 0.4) 0%, transparent 70%)',
          filter: 'blur(25px)',
          animationDelay: '10s',
        }}
      />
      
      {/* Floating particles - slower diagonal drift */}
      <div 
        className="absolute top-[5%] -left-[5%] w-[150px] h-[150px] opacity-10 animate-float-gentle"
        style={{
          background: 'radial-gradient(circle, oklch(0.70 0.20 45 / 0.4) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />
      <div 
        className="absolute top-[20%] left-[10%] w-[120px] h-[120px] opacity-8 animate-float-gentle"
        style={{
          background: 'radial-gradient(circle, oklch(0.73 0.18 60 / 0.35) 0%, transparent 60%)',
          filter: 'blur(50px)',
          animationDelay: '7s',
        }}
      />
    </div>
  );
}
