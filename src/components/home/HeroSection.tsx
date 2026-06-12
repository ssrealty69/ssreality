'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Building2, CheckCircle2, Play } from 'lucide-react';

export default function HeroSection() {
  const [loadVideo, setLoadVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Lazy-load YouTube iframe: load after a short delay or interaction (desktop only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    
    // Instead of loading after 1.5s (which blocks the main thread during Lighthouse TBT window),
    // load it only on user interaction or after a very long delay (8s).
    const timer = setTimeout(() => setLoadVideo(true), 8000);
    
    const handleInteraction = () => setLoadVideo(true);
    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    window.addEventListener('mousemove', handleInteraction, { once: true, passive: true });

    // Listen to postMessage state change events from the YouTube Player
    const handleYoutubeMessage = (event: MessageEvent) => {
      if (event.origin && event.origin.includes('youtube.com')) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data && data.event === 'infoDelivery' && data.info && data.info.playerState === 1) {
            setIsVideoPlaying(true);
          }
        } catch (e) {
          // ignore parsing errors from other message events
        }
      }
    };

    window.addEventListener('message', handleYoutubeMessage);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('message', handleYoutubeMessage);
    };
  }, []);

  // Safety fallback: if video is loading but doesn't play or message is blocked, fade poster anyway after 6s
  useEffect(() => {
    if (loadVideo && !isVideoPlaying) {
      const backupTimer = setTimeout(() => {
        setIsVideoPlaying(true);
      }, 6000);
      return () => clearTimeout(backupTimer);
    }
  }, [loadVideo, isVideoPlaying]);

  return (
    <section ref={sectionRef} className="relative h-[100vh] min-h-[600px] w-full overflow-hidden flex flex-col justify-center items-center font-sans">
      
      {/* Background: Poster image first, then YouTube iframe */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        {/* Lightweight poster image (loads instantly) */}
        <Image
          src="https://img.youtube.com/vi/M-j_LvEK2ZA/maxresdefault.jpg"
          alt="SS Realty Hero Background"
          fill
          className={`object-cover transition-opacity duration-1000 ${isVideoPlaying ? 'opacity-0' : 'opacity-100'}`}
          priority
          sizes="100vw"
          quality={75}
        />

        {/* YouTube iframe (loads only after delay/interaction) */}
        {loadVideo && (
          <div className="absolute inset-0 pointer-events-none">
            <iframe
              src="https://www.youtube-nocookie.com/embed/M-j_LvEK2ZA?autoplay=1&mute=1&loop=1&playlist=M-j_LvEK2ZA&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&enablejsapi=1"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vw] h-[61.87vw] min-h-[110vh] min-w-[195.55vh] border-0 scale-110 pointer-events-none"
              allow="autoplay; encrypted-media"
              title="SS Realty background video"
              loading="lazy"
              tabIndex={-1}
            />
          </div>
        )}
      </div>

      {/* Reduced overlay opacity to show video better */}
      <div className="absolute inset-0 bg-[#0A0A0A]/40 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0A0A0A]/70 z-0 pointer-events-none" />

      {/* Content Container (Perfectly Centered & Scaled Down) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center mt-8">
        
        {/* Top Badge (Matched to website's Gold Theme) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#C9A227]/30 rounded-full bg-[#C9A227]/10 backdrop-blur-md mb-6 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
          <span className="text-[11px] font-bold text-[#F0D060] tracking-widest uppercase">
            Delhi NCR's No.1 Real Estate Platform
          </span>
        </div>

        {/* Main Title (Smooth sizing and Gold Gradient) */}
        <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold tracking-tight leading-[1.1] mb-5 drop-shadow-lg">
          <span style={{ 
            color: '#FFFFFF',
            WebkitTextStroke: '0.6px rgba(232, 213, 163, 0.8)',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.8), 0 0 4px rgba(201, 162, 39, 0.3)'
          }}>
            Find Your Perfect Property,
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#C9A227] text-transparent bg-clip-text">
            Anywhere in Delhi NCR.
          </span>
        </h1>

        {/* Subtitle (Smaller and refined) */}
        <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed mb-8 font-medium">
          10,000+ premium residential and commercial properties from trusted builders. <br className="hidden md:block" /> 
          Flats, Villas, Plots, Offices & more — all in one place.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center mb-16 w-full">
          <Link 
            href="/properties" 
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#C2410C] text-white font-bold rounded-xl hover:bg-[#9A3412] hover:scale-[1.03] transition-all duration-300 shadow-[0_4px_14px_0_rgba(194,65,12,0.45)] text-[15px] cursor-pointer"
          >
            Explore Properties Free
          </Link>
        </div>

        {/* Bottom Trust Indicators (Smaller, cleaner, exact layout) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 pt-8">
          
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#F97316]" fill="currentColor" />
            <span className="text-[11px] font-bold text-gray-400 tracking-widest">4.8 RATING</span>
          </div>

          <div className="hidden sm:block w-px h-3 bg-gray-600" />

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C9A227]" />
            <span className="text-[11px] font-bold text-gray-400 tracking-widest">2000+ PROPERTIES</span>
          </div>

          <div className="hidden sm:block w-px h-3 bg-gray-600" />

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span className="text-[11px] font-bold text-gray-400 tracking-widest">VERIFIED BUILDERS</span>
          </div>

        </div>

      </div>
    </section>
  );
}
