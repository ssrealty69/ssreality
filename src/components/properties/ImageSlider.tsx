"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
  images: string[];
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const fallbackImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'
  ];

  let displayImages = images && images.length > 0 ? images : fallbackImages;
  if (displayImages.length === 1) {
    displayImages = [displayImages[0], ...fallbackImages.slice(1, 5)];
  } else if (displayImages.length > 0 && displayImages.length < 5) {
    // Fill up to 5 if there's less
    const needed = 5 - displayImages.length;
    displayImages = [...displayImages, ...fallbackImages.slice(0, needed)];
  }

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  }, [displayImages.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  }, [displayImages.length]);

  // Auto-play logic
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // Change slide every 3 seconds
    
    return () => clearInterval(interval);
  }, [nextSlide, isHovered]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    
    // Reset touch values
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Only render current, previous, and next slides (not all 5)
  const getVisibleIndices = () => {
    const prev = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
    const next = currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1;
    return new Set([prev, currentIndex, next]);
  };

  const visibleIndices = getVisibleIndices();

  return (
    <div 
      className="relative w-full h-full group bg-gray-100 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images container - only render nearby slides */}
      {displayImages.map((src, idx) => (
        visibleIndices.has(idx) ? (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image 
              src={src} 
              alt={`Property slide ${idx + 1}`} 
              fill 
              className="object-cover" 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={idx === 0}
              loading={idx === 0 ? 'eager' : 'lazy'}
              quality={80}
            />
          </div>
        ) : (
          <div key={idx} className="absolute inset-0 opacity-0 z-0" />
        )
      ))}
      
      {displayImages.length > 1 && (
        <>
          {/* Always visible left arrow */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#1A1800]/70 text-white p-2 rounded-full z-20 hover:bg-[#C9A227] hover:text-[#1A1800] transition-colors shadow-lg"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          
          {/* Always visible right arrow */}
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1A1800]/70 text-white p-2 rounded-full z-20 hover:bg-[#C9A227] hover:text-[#1A1800] transition-colors shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {displayImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 shadow-md ${
                  idx === currentIndex ? 'bg-[#C9A227] w-6' : 'bg-white/80 hover:bg-white w-2'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
