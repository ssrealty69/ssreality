'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative aspect-[3/4] md:aspect-[16/10] w-full rounded-3xl overflow-hidden bg-gray-100 group shadow-xl">
        <Image
          src={images[activeIndex]}
          alt={title}
          fill
          className="object-cover transition-all duration-700 ease-in-out"
          priority
        />
        
        {/* Navigation Arrows (Red Circular Buttons like Screenshot) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#FF3838] flex items-center justify-center text-white shadow-lg transform transition-transform active:scale-95 hover:bg-[#D63031] z-20"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#FF3838] flex items-center justify-center text-white shadow-lg transform transition-transform active:scale-95 hover:bg-[#D63031] z-20"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails (Scrollable) */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                activeIndex === idx ? 'border-[#C9A227] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`${title} ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
