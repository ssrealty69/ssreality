"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check, Heart, Star, Download, Eye, ChevronLeft, ChevronRight,
  MapPin, ShieldAlert, Award, PhoneCall, X, CheckCircle2, Loader2
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Property } from '@/types';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const BrochureModal = dynamic(() => import('./BrochureModal'), { ssr: false });

// Helper to strip HTML tags and decode basic HTML entities
function stripHtml(html: string) {
  if (!html) return '';
  let text = html.replace(/<[^>]*>/g, '');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
  return text.trim();
}

interface PremiumPropertyCardProps {
  property: Property;
  priority?: boolean;
}

export default function PremiumPropertyCard({ property, priority = false }: PremiumPropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // States for Brochure modal
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  // Use interiorImages (from admin "Apartment Interior / Overview Images" section) as primary.
  // Fall back to property.images if no interior images exist.
  const images =
    property.interiorImages && property.interiorImages.length > 0
      ? property.interiorImages
      : property.images && property.images.length > 0
        ? property.images
        : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'];

  // Check if saved as favorite on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favorites = JSON.parse(localStorage.getItem('ss_realty_favorites') || '[]');
      setIsFavorite(favorites.includes(property._id));
    }
  }, [property._id]);

  // Handle wishlist toggle
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const favorites = JSON.parse(localStorage.getItem('ss_realty_favorites') || '[]');
      let updatedFavorites;
      if (isFavorite) {
        updatedFavorites = favorites.filter((id: string) => id !== property._id);
        setIsFavorite(false);
      } else {
        updatedFavorites = [...favorites, property._id];
        setIsFavorite(true);
      }
      localStorage.setItem('ss_realty_favorites', JSON.stringify(updatedFavorites));
    }
  };

  // Image slider navigation
  const prevSlide = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextSlide = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Auto-play logic (slides every 3.5 seconds)
  useEffect(() => {
    if (isHovered || images.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3500);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered, images.length]);

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Stable Rating generation based on ID
  const rating = useMemo(() => {
    const hash = property._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (4.5 + (hash % 5) * 0.1).toFixed(1);
  }, [property._id]);

  // dynamic subtitle
  const subtitle = useMemo(() => {
    const bhk = property.features.bedrooms ? `${property.features.bedrooms} BHK ` : '';
    const typeLabel = property.propertyType === 'plot'
      ? 'Freehold Land/Plot'
      : property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1);
    return `${bhk}${typeLabel} in ${property.location.address || property.location.city}`;
  }, [property]);

  // config list
  const configList = useMemo(() => {
    if (property.priceList && property.priceList.length > 0) {
      return property.priceList.slice(0, 3);
    }

    // Fallback configurations derived from details
    const bhkStr = property.features.bedrooms ? `${property.features.bedrooms} BHK Apartment` : 'Premium Unit';
    const areaStr = property.features.area 
      ? `${property.features.area} ${(property.features.areaUnit || 'sqft') === 'sqyd' ? 'Sq. Yd.' : (property.features.areaUnit || 'sqft').toUpperCase()}` 
      : '';
    const priceStr = formatPrice(property.price);

    return [
      { type: bhkStr, size: areaStr, price: priceStr }
    ];
  }, [property]);

  // dynamic construction status info
  const constructionStatus = useMemo(() => {
    if (property.status === 'delivered') return 'Delivered & Ready';
    if (property.propertyType === 'plot') return 'Ready for Construction';

    // Predictable completion based on ID hashing
    const hash = property._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isReady = hash % 2 === 0;
    if (isReady) return 'Ready to Move';

    const months = ['Mar', 'Jun', 'Sep', 'Dec'];
    const years = ['2026', '2027', '2028'];
    return `New Launch - Completion in ${months[hash % 4]} ${years[hash % 3]}`;
  }, [property]);

  const waMessage = encodeURIComponent(`Hello, I am interested in ${property.title} located in ${property.location.address}, ${property.location.city}. Please share more details.`);
  const waLink = `https://wa.me/919311059100?text=${waMessage}`;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row group/card hover:border-[#C9A227]/40 relative"
    >
      {/* ── IMAGE SECTION (LEFT) ── Optimized to aspect-video (16:9) with ambient blur background to prevent cropping or solid black/gray letterboxes */}
      <div
        className="w-full md:w-[360px] lg:w-[400px] xl:w-[440px] aspect-[4/3] md:aspect-video relative shrink-0 overflow-hidden "
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slider Images — pure opacity crossfade (no scale = no blur) */}
        {images.map((src, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentImageIndex
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
              }`}
          >
            {/* Background colour fill — no extra image download, no forced reflow */}
            <div className="absolute inset-0 bg-gray-900" />

            <Image
              src={src}
              alt={`${property.title} - Image ${idx + 1}`}
              fill
              className="object-cover md:object-contain z-10"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1400px"
              priority={priority && idx === 0}
              loading={priority && idx === 0 ? 'eager' : 'lazy'}
              quality={70}
            />
          </div>
        ))}

        {/* Ambient Dark Gradient Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35 z-10 pointer-events-none" />

        {/* Top-Left Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 max-w-[80%]">
          {property.projectDetails?.reraNo && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black tracking-wider rounded-md shadow-md uppercase">
              <Award size={10} /> RERA
            </span>
          )}

          {/* VERIFIED + Project Name — joined pill */}
          <div className="flex items-stretch shadow-md rounded-md overflow-hidden backdrop-blur-md">
            <span className="px-2.5 py-1 bg-white/90 text-[#1A1800] text-[10px] font-black tracking-wider uppercase">
              VERIFIED
            </span>
            {(property.propertyName || property.projectDetails?.projectName) && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-[#C9A227]/80 to-[#F0D060]/80 text-[#1A1800] text-[10px] font-black tracking-wider uppercase border-l border-[#C9A227]/40">
                {property.propertyName || property.projectDetails?.projectName}
              </span>
            )}
          </div>
        </div>

        {/* Top-Right Favorite Heart */}
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 active:scale-90"
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            className={`transition-colors duration-300 ${isFavorite ? "fill-red-500 text-red-500" : "text-white hover:text-red-400"}`}
          />
        </button>

        {/* Slider Navigation Arrows (Visible on hover on desktop, always visible on mobile) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-[#C9A227] hover:text-[#1A1800] text-white flex items-center justify-center z-20 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 hover:scale-105 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-[#C9A227] hover:text-[#1A1800] text-white flex items-center justify-center z-20 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 hover:scale-105 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Bottom-Left Construction Status Overlay */}
        <div className="absolute bottom-8 left-4 z-20 text-white font-medium text-xs drop-shadow-md">
          {constructionStatus}
        </div>

        {/* Dot Indicators (bottom-center) — composited transform-based width, min touch area 44px */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-0 z-20 pointer-events-auto">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(idx); }}
                className="flex items-center justify-center w-[44px] h-[44px] rounded-full"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={`block h-1.5 rounded-full shadow-sm transition-[width] duration-300 ${
                    idx === currentImageIndex ? 'bg-[#C9A227] w-5' : 'bg-white/70 w-1.5'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── DETAILS SECTION (RIGHT) ── */}
      <div className="flex-1 p-5 md:p-6 lg:p-7 flex flex-col justify-between relative bg-white">

        {/* Top-Right Ribbon/Tag */}
        <div className="absolute top-5 right-5 z-10 shrink-0">
          <span className="px-3 py-1 bg-[#C9A227]/10 text-[#7A5C00] text-[10px] font-black tracking-widest rounded-full uppercase">
            {property.priceType === 'rent' ? 'For Rent' : 'New Launch'}
          </span>
        </div>

        {/* Header Block */}
        <div className="pr-24">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-xl lg:text-2xl font-bold text-[#1A1800] tracking-tight line-clamp-1 font-[var(--font-playfair)]">
              {property.title}
            </h3>
            {/* Rating badge */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 text-amber-800 rounded text-[11px] font-black shrink-0">
              <Star size={10} className="fill-amber-500 text-amber-500" />
              <span>{rating}</span>
            </div>
          </div>
          <p className="text-xs lg:text-sm text-[#64748B] font-medium flex items-center gap-1">
            <MapPin size={13} className="text-[#C9A227]" /> {subtitle}
          </p>
        </div>

        {/* Configuration / Pricing Table */}
        <div className="my-5 border border-gray-100 rounded-2xl overflow-hidden bg-[#FFFEF9]">
          <div className="grid grid-cols-3 bg-[#1A1800] text-[#F0D060] px-4 py-2 text-[10px] font-black uppercase tracking-wider">
            <div>Configuration</div>
            <div>Area / Size</div>
            <div className="text-right">Price</div>
          </div>
          <div className="divide-y divide-gray-100">
            {configList.map((item: { type: string; size: string; price: string; negotiable?: boolean }, idx: number) => (
              <div key={idx} className="grid grid-cols-3 px-4 py-3 text-xs text-gray-700 font-semibold items-center">
                <div className="text-gray-900 truncate pr-2">{item.type}</div>
                <div className="text-gray-500 truncate pr-2">{item.size}</div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[#6B4C00] font-bold">{item.price}</span>
                  {item.negotiable && (
                    <span className="text-[8px] font-black text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-200 uppercase tracking-widest mt-0.5 leading-none shrink-0 scale-95 origin-right">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby / Location Highlights */}
        {property.nearby && property.nearby.length > 0 && (
          <div className="hidden md:flex mb-4 items-center gap-1.5 flex-wrap text-xs text-gray-600">
            <span className="font-bold text-[#1A1800] shrink-0">Nearby:</span>
            {property.nearby.slice(0, 3).map((nb, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                {nb.name} {nb.distance ? `(${nb.distance})` : ''}
              </span>
            ))}
            {property.nearby.length > 3 && (
              <span className="text-[10px] font-bold text-[#7A5C00] shrink-0">+{property.nearby.length - 3} more</span>
            )}
          </div>
        )}

        {/* Short Description */}
        <p className="text-xs lg:text-sm text-gray-500 line-clamp-2 leading-relaxed mb-5">
          {stripHtml(property.description)}
        </p>

        {/* Bottom Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50 mt-auto">
          {/* Builder / Agent Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A1800] to-gray-800 flex items-center justify-center text-[#F0D060] font-black text-xs shrink-0 border border-[#C9A227]/20">
              SSR
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Listing Agent</p>
              <p className="text-xs font-bold text-gray-800">{property.agent?.name || 'SS Realty Agent'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Outlined Brochure/Enquire button */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBrochureModal(true); }}
              className="px-4 py-2.5 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-950 hover:text-white transition-all duration-300 font-poppins font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} /> Brochure
            </button>

            {/* View Details gold gradient button */}
            <Link
              href={`/properties/${property._id}`}
              aria-label={`View details for ${property.title}`}
              className="px-5 py-2.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] hover:brightness-105 transition-all duration-300 font-poppins font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-1.5 shadow-[0_4px_14px_rgba(201,162,39,0.25)] hover:shadow-[0_6px_20px_rgba(201,162,39,0.4)] active:scale-95"
            >
              <Eye size={13} /> View Details
            </Link>
          </div>
        </div>

      </div>

      {/* Dynamic Pop-up Brochure Form Modal */}
      {showBrochureModal && (
        <BrochureModal 
          property={property} 
          images={images} 
          waLink={waLink} 
          onClose={() => setShowBrochureModal(false)} 
        />
      )}
    </article>
  );
}
