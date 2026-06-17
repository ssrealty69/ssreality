'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Building2, CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Defer video load until well after LCP so it never competes with critical resources.
  // Connection-aware: skip entirely on 2G/3G or when save-data is requested.
  // Responsive: serve w_640 on mobile (<768px) and w_1280 on desktop to cut payload ~50%.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Skip video on slow connections or data-saver mode
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    };
    const conn = nav.connection;
    const isSlowConnection =
      conn?.saveData === true ||
      conn?.effectiveType === 'slow-2g' ||
      conn?.effectiveType === '2g' ||
      conn?.effectiveType === '3g';

    if (isSlowConnection) return; // Poster image is sufficient fallback

    // Responsive width: 768 on narrow viewports, 1920 on desktop
    const width = window.innerWidth < 768 ? 768 : 1920;
    const videoUrl = `https://res.cloudinary.com/ddpahrqfk/video/upload/q_auto:good,f_auto,w_${width}/v1781260563/SS_Realty_Hero_Section_Video_bdnplb.mp4`;

    // 5 s delay — ensures LCP image, fonts, and above-fold JS finish first
    const timer = setTimeout(() => {
      video.src = videoUrl;
      video.load();
      video.play().catch((err) => console.log("Autoplay prevented:", err));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-[100vh] min-h-[600px] w-full overflow-hidden flex flex-col justify-center items-center font-sans">
      
      {/* Background: Poster image shown immediately (no render blocking), video loads lazily */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-[#0A0A0A]">
        {/* Poster image loads instantly — critical for LCP */}
        <Image
          src="https://res.cloudinary.com/ddpahrqfk/video/upload/q_auto,f_webp,w_1280/v1781260563/SS_Realty_Hero_Section_Video_bdnplb.jpg"
          alt="SS Realty Hero Background"
          fill
          priority
          quality={50}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1280px"
        />
        {/* Video loads after 3s — does not block initial render */}
        <video
          ref={videoRef}
          poster="https://res.cloudinary.com/ddpahrqfk/video/upload/q_auto,f_webp,w_1280/v1781260563/SS_Realty_Hero_Section_Video_bdnplb.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
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
