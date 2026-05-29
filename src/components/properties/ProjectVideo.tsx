'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

export default function ProjectVideo({ title, videoUrl }: { title: string, videoUrl?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract YouTube ID from URL or use fallback
  let videoId = "M-j_LvEK2ZA";
  if (videoUrl) {
    const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match && match[1]) {
      videoId = match[1];
    }
  }

  if (isPlaying) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-[6px] bg-gradient-to-br from-[#C9A227] via-[#F0D060] to-[#8a6d0a] rounded-[32px] shadow-2xl relative overflow-hidden group">
          {/* Subtle Shine Animation for the Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
          
          <div className="relative w-full aspect-video rounded-[26px] overflow-hidden bg-black border-4 border-white shadow-inner">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&playlist=${videoId}&loop=1&enablejsapi=1`}
              title="Project Video"
              className="absolute inset-0 w-full h-full border-0 pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="p-[6px] bg-gradient-to-br from-[#C9A227] via-[#F0D060] to-[#8a6d0a] rounded-[32px] shadow-2xl shadow-[#C9A227]/20 group relative overflow-hidden">
        {/* Border Shine Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
        
        <div 
          className="relative w-full aspect-video rounded-[26px] overflow-hidden cursor-pointer border-4 border-white shadow-inner"
          onClick={() => setIsPlaying(true)}
        >
          <Image 
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
            alt="Project Video Preview" 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-700" 
            sizes="(max-width: 768px) 100vw, 896px"
            quality={75}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#C9A227]/40 via-transparent to-transparent opacity-80" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-[#C9A227] fill-[#C9A227] ml-1" />
            </div>
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center px-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#F0D060] font-black mb-1 opacity-80">Virtual Tour</p>
            <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg font-[var(--font-playfair)]">
              {title} Walkthrough
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
