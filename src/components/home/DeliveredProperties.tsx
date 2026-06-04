"use client";

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Check, MapPin, Compass, ExternalLink, Sparkles, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Property } from '@/types';

interface DeliveredPropertiesProps {
  properties: Property[];
}

function DeliveredPropertyCard({ property }: { property: Property }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mainImage = mainImageError || !property.images?.[0]
    ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
    : property.images[0];
  const hoverImage = property.images?.[1] || mainImage;
  const hasSecondImage = !!property.images?.[1] && !imageError;

  const mapLink = property.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.title + ', ' + property.location.address + ', ' + property.location.city)}`;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white/95 border border-[#C9A227]/25 hover:border-[#C9A227]/60 shadow-[0_12px_28px_rgba(201,162,39,0.05)] hover:shadow-[0_18px_36px_rgba(201,162,39,0.12)] transition-all duration-500 rounded-2xl overflow-hidden flex flex-col h-full group relative p-5 select-none"
    >
      {/* Decorative Golden Hover Ambient Glow inside card */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,162,39,0.04)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* 1. Circle Image Container - Exquisite circular design (Enlarged to Majestic w-56 h-56) */}
      <div className="relative w-56 h-56 mx-auto mb-5 shrink-0 flex items-center justify-center">
        
        {/* Dash rotating gold ring */}
        <div className="absolute -inset-1.5 border border-dashed border-[#C9A227]/50 rounded-full animate-[spin_25s_linear_infinite]" />
        
        {/* Glow halo behind the circle on hover */}
        <div className="absolute inset-0 bg-[#C9A227]/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Perfect Circle Image Wrapper */}
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#C9A227] shadow-[0_6px_12px_rgba(201,162,39,0.1)] group-hover:shadow-[0_8px_16px_rgba(201,162,39,0.2)] transition-shadow duration-500 bg-[#FAF8F2]">
          
          {/* Soft shadow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />

          {/* Main Image */}
          <Image
            src={mainImage}
            alt={`${property.title} - ${property.location.city}`}
            fill
            className={`object-cover transition-all duration-1000 ease-out ${isHovered && hasSecondImage ? 'opacity-0 scale-110' : 'opacity-100 scale-100 group-hover:scale-105'}`}
            sizes="(max-width: 768px) 100vw, 600px"
            quality={100}
            priority
            unoptimized
            onError={() => setMainImageError(true)}
          />

          {/* Hover Image */}
          {property.images?.[1] && !imageError && (
            <Image
              src={hoverImage}
              alt={`${property.title} - View 2`}
              fill
              className={`object-cover transition-all duration-1000 ease-out ${isHovered ? 'opacity-100 scale-105' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, 600px"
              quality={100}
              priority
              unoptimized
              onError={() => setImageError(true)}
            />
          )}

          {/* Miniature Delivered Dot Overlay */}
          <div className="absolute top-4 right-4 z-20">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
        </div>

        {/* Small Elegant floating type stamp */}
        <div className="absolute -bottom-2 px-3 py-0.5 bg-white border border-[#C9A227]/40 text-[#AA7C11] text-[9px] font-black rounded-full shadow-sm uppercase tracking-wider z-20">
          {property.propertyType}
        </div>
      </div>

      {/* 2. Text Details Area */}
      <div className="flex flex-col flex-grow text-center items-center w-full">
        {/* Title */}
        <h3 className="text-base font-bold text-[#1A1800] group-hover:text-[#AA7C11] mb-0.5 leading-tight line-clamp-1 transition-colors duration-300 font-serif tracking-tight w-full">
          {property.title}
        </h3>
        
        {/* Address */}
        <div className="flex items-center justify-center gap-1 text-gray-500 text-[11px] mb-3 font-medium w-full">
          <MapPin size={10} className="text-[#C9A227] shrink-0" />
          <span className="line-clamp-1">{property.location.address}, {property.location.city}</span>
        </div>

        {/* 3. Unique Accordion Dropdown Trigger for Highlights */}
        <button
          onClick={() => setIsExpanded(true)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-[#C9A227]/10 hover:bg-[#C9A227]/15 border border-[#C9A227]/25 text-[#AA7C11] text-[10px] font-black rounded-full uppercase tracking-wider mb-4 transition-all duration-300 shadow-sm cursor-pointer"
        >
          <span>Project Highlights</span>
          <ChevronDown size={11} className="text-[#C9A227] shrink-0" />
        </button>

        {/* 4. Sliding Glass Highlights Panel - Exquisite slide-up overlay */}
        <div 
          className={`absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-lg border-t border-[#C9A227]/30 z-30 flex flex-col p-4 transition-all duration-500 ease-out rounded-b-2xl h-fit ${isExpanded ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}
        >
          <div className="flex items-center gap-1.5 text-[#AA7C11] text-[10px] font-black uppercase tracking-[0.15em] mb-3 select-none">
            <Sparkles size={12} className="text-[#C9A227]" />
            <span>Luxury Highlights</span>
          </div>

          <div className="space-y-2.5 py-1.5 text-left mb-3">
            {(property.amenities || []).slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[10px] text-gray-700 font-semibold group/item">
                <div className="p-0.5 bg-[#C9A227]/10 rounded-full border border-[#C9A227]/30 mt-0.5 shrink-0">
                  <Check size={8} className="text-[#AA7C11] font-bold" />
                </div>
                <span className="line-clamp-2 transition-colors duration-300 group-hover/item:text-[#AA7C11] leading-tight">{amenity}</span>
              </div>
            ))}
          </div>

          {/* Close Panel Button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(false); }}
            className="py-2 bg-[#C9A227]/15 hover:bg-[#C9A227]/25 border border-[#C9A227]/40 text-[#AA7C11] text-[9px] font-black rounded-lg uppercase tracking-wider transition-all duration-300 w-full flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          >
            <span>Close Highlights</span>
          </button>
        </div>

        {/* 5. View Location Trigger Button */}
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group/btn w-full mt-auto py-2.5 bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#AA7C11] text-white font-black rounded-xl text-center shadow-sm hover:shadow-[0_3px_12px_rgba(201,162,39,0.25)] active:scale-[0.98] transition-all relative overflow-hidden flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em] select-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          <span className="relative z-10 flex items-center gap-1.5 font-bold">
            View Location
            <ExternalLink size={10} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </span>
        </a>
      </div>
    </article>
  );
}

export default function DeliveredProperties({ properties }: DeliveredPropertiesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);

  const displayProperties = useMemo(() => {
    return properties;
  }, [properties]);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1024) {
        setCardsPerView(4);
      } else if (window.innerWidth >= 768) {
        setCardsPerView(3);
      } else if (window.innerWidth >= 640) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const numDots = Math.max(1, displayProperties.length - cardsPerView + 1);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const item = container.firstElementChild as HTMLElement;

    // If we're at the very end (within 8px tolerance), snap to last dot
    if (maxScroll > 0 && scrollLeft >= maxScroll - 8) {
      setActiveIndex(numDots - 1);
      return;
    }

    if (item) {
      const cardWidth = item.offsetWidth + 24; // card width + gap-6 (24px)
      if (cardWidth > 0) {
        const newIndex = Math.min(Math.round(scrollLeft / cardWidth), numDots - 1);
        if (newIndex >= 0) {
          setActiveIndex(newIndex);
        }
      }
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById('delivered-landmarks-slider');
    const item = container?.firstElementChild as HTMLElement;
    if (container && item) {
      const cardWidth = item.offsetWidth + 24; // card width + gap-6
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('delivered-landmarks-slider');
    const item = container?.firstElementChild as HTMLElement;
    if (container && item) {
      const cardWidth = item.offsetWidth + 24; // card width + gap-6
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  if (displayProperties.length === 0) return null;

  return (
    <section className="py-16 bg-[#FDFBF7] border-t border-b border-[#C9A227]/30 relative overflow-hidden font-sans">
      
      {/* Dynamic Scoped CSS for Hiding Scrollbars and Interlocking Golden Wave Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drawGrowthWave {
          0% {
            stroke-dashoffset: 1500;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1500;
          }
        }
        @keyframes drawGrowthWaveReverse {
          0% {
            stroke-dashoffset: -1500;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 1500;
          }
        }
        .animate-growth-wave-1 {
          stroke-dasharray: 1500;
          animation: drawGrowthWave 18s linear infinite;
        }
        .animate-growth-wave-2 {
          stroke-dasharray: 1500;
          animation: drawGrowthWaveReverse 25s linear infinite;
        }
        /* Bulletproof scrollbar hider */
        .hide-scrollbar-dynamic::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .hide-scrollbar-dynamic {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* Luxury Art-Deco Interlocking Arch Pattern Background */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="luxury-arches" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 0 30 Q 15 0 30 30 Q 45 60 60 30" fill="none" stroke="#C9A227" strokeWidth="1.2" />
              <path d="M 0 30 Q 15 60 30 30 Q 45 0 60 30" fill="none" stroke="#C9A227" strokeWidth="0.8" strokeDasharray="3,3" />
              <circle cx="30" cy="30" r="2.5" fill="#C9A227" />
              <circle cx="0" cy="30" r="1.5" fill="#AA7C11" />
              <circle cx="60" cy="30" r="1.5" fill="#AA7C11" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#luxury-arches)" />
        </svg>
      </div>

      {/* Double Golden Wave Intersecting Curves */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-80 opacity-30 pointer-events-none z-0">
        <svg className="w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 240">
          <path
            d="M -100,160 C 200,220 400,30 700,120 C 1000,210 1200,60 1540,90"
            stroke="url(#growing-gold-line-1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="animate-growth-wave-1"
          />
          <path
            d="M -100,80 C 250,180 500,20 800,160 C 1100,90 1250,200 1540,110"
            stroke="url(#growing-gold-line-2)"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-growth-wave-2 opacity-60"
          />
          <defs>
            <linearGradient id="growing-gold-line-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#AA7C11" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#DFBF58" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C9A227" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="growing-gold-line-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A227" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#DFBF58" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#AA7C11" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Floating Sparkles in the Background */}
      <div className="absolute top-10 left-10 text-[#C9A227]/25 animate-pulse pointer-events-none select-none">
        <Sparkles size={32} />
      </div>
      <div className="absolute bottom-16 right-12 text-[#C9A227]/20 animate-pulse pointer-events-none select-none" style={{ animationDelay: '2s' }}>
        <Sparkles size={24} />
      </div>
      <div className="absolute top-1/3 right-1/4 text-[#C9A227]/15 animate-pulse pointer-events-none select-none" style={{ animationDelay: '4s' }}>
        <Sparkles size={20} />
      </div>
      
      {/* Luxury soft ambient light sources */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#C9A227]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#C9A227]/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block - Reduced Bottom Margin */}
        <div className="text-center mb-10 space-y-3 relative">
          {/* Header Ambient Glow Backdrop */}
          <div className="absolute -inset-x-20 top-1/2 -translate-y-1/2 h-32 bg-[#C9A227]/8 blur-3xl rounded-full pointer-events-none z-0" />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-full shadow-inner backdrop-blur-sm select-none">
            <Sparkles size={11} className="text-[#AA7C11] animate-pulse" />
            <span className="text-[9px] font-black text-[#AA7C11] uppercase tracking-[0.2em]">Gold Standards Delivered</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 font-serif tracking-tight">
            Our Delivered <span className="bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent">Landmarks</span>
          </h2>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2.5 max-w-xs mx-auto select-none">
            <div className="h-[1px] bg-gradient-to-r from-transparent to-[#C9A227] flex-grow" />
            <div className="w-1.5 h-1.5 rotate-45 border border-[#C9A227] bg-[#FDFBF7]" />
            <div className="h-[1px] bg-gradient-to-l from-transparent to-[#C9A227] flex-grow" />
          </div>

          <p className="text-gray-600 max-w-xl mx-auto text-xs md:text-sm leading-relaxed font-medium">
            Explore our legacy of successfully completed, fully handed over premium residential and commercial spaces across the region.
          </p>
        </div>

        {/* Slider Container with absolute desktop arrows */}
        <div className="relative w-full px-1">
          
          {/* Left Desktop Arrow Button */}
          <button
            onClick={scrollLeft}
            className="absolute -left-5 lg:-left-7 top-[48%] -translate-y-1/2 w-12 h-12 bg-white/95 border border-[#C9A227]/35 hover:border-[#C9A227]/70 hover:bg-white text-[#AA7C11] rounded-full items-center justify-center shadow-lg transition-all duration-300 z-40 hidden md:flex hover:scale-105 active:scale-95 cursor-pointer hover:shadow-[#C9A227]/25"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} className="shrink-0" />
          </button>

          {/* Cards Horizontal Swipe Slider - Bulletproof Scrollbar Hide */}
          <div 
            id="delivered-landmarks-slider"
            onScroll={handleScroll}
            className="flex flex-row flex-nowrap overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar-dynamic w-full scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayProperties.map((p) => (
              <div key={p._id} className="min-w-[85vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[22vw] snap-start shrink-0 h-full">
                <DeliveredPropertyCard property={p} />
              </div>
            ))}
          </div>

          {/* Right Desktop Arrow Button */}
          <button
            onClick={scrollRight}
            className="absolute -right-5 lg:-right-7 top-[48%] -translate-y-1/2 w-12 h-12 bg-white/95 border border-[#C9A227]/35 hover:border-[#C9A227]/70 hover:bg-white text-[#AA7C11] rounded-full items-center justify-center shadow-lg transition-all duration-300 z-40 hidden md:flex hover:scale-105 active:scale-95 cursor-pointer hover:shadow-[#C9A227]/25"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} className="shrink-0" />
          </button>
          
        </div>

        {/* Custom Premium Golden Pagination Indicators - Visible on all viewports */}
        <div className="flex justify-center items-center gap-2 mt-6 select-none">
          {Array.from({ length: numDots }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                const container = document.getElementById('delivered-landmarks-slider');
                const item = container?.firstElementChild as HTMLElement;
                if (container && item) {
                  // For the last dot, scroll to the absolute end
                  if (idx === numDots - 1) {
                    container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
                  } else {
                    const cardWidth = item.offsetWidth + 24;
                    container.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
                  }
                  setActiveIndex(idx);
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-[#AA7C11]' : 'w-1.5 bg-[#C9A227]/30 hover:bg-[#C9A227]/50'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
