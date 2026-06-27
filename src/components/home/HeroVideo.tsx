'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HeroVideo() {
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

    // 5 s delay - ensures LCP image, fonts, and above-fold JS finish first
    const timer = setTimeout(() => {
      video.src = videoUrl;
      video.load();
      video.play().catch((err) => console.log("Autoplay prevented:", err));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-[#0A0A0A]">
      {/* Poster image loads instantly - critical for LCP */}
      <Image
        src="https://res.cloudinary.com/ddpahrqfk/video/upload/q_auto,f_webp,w_1280/v1781260563/SS_Realty_Hero_Section_Video_bdnplb.jpg"
        alt="SS Realty Hero Background"
        fill
        priority
        quality={50}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 1280px"
      />
      {/* Video loads after 5s - does not block initial render */}
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
  );
}
