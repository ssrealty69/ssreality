'use client';

import { useState, useEffect } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Hide preloader faster — 800ms is enough for perception of quality
    const timer = setTimeout(() => {
      setLoading(false);
      // Wait for fade animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 100);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#0A0A0A] transition-opacity duration-500 ease-in-out ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#C9A227 0.5px, transparent 0.5px)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black opacity-60" />

      <div className="relative flex flex-col items-center z-10">
        {/* Logo — use standard <img> with static path (no cache buster) for instant load */}
        <div className="relative w-56 h-56 md:w-72 md:h-72 animate-logo-float">
          <img
            src="/SS Realty Official Logo.png"
            alt="SS Realty Logo"
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(201,162,39,0.3)]"
          />
        </div>

        {/* Premium loading indicator */}
        <div className="mt-12 flex flex-col items-center">
          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#C9A227] to-transparent w-full animate-premium-loading" />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-[#C9A227] animate-ping" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-bold">
              Loading <span className="text-[#C9A227]">Excellence</span>
            </p>
            <span className="w-1 h-1 rounded-full bg-[#C9A227] animate-ping" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes premium-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes logo-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        .animate-premium-loading {
          animation: premium-loading 1.5s infinite ease-in-out;
        }
        .animate-logo-float {
          animation: logo-float 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
