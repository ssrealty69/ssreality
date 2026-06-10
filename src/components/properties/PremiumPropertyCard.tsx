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
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

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
  const [brochureName, setBrochureName] = useState('');
  const [brochurePhone, setBrochurePhone] = useState('');
  const [selectedBhk, setSelectedBhk] = useState('3 BHK');
  const [brochureLoading, setBrochureLoading] = useState(false);
  const [brochureSubmitted, setBrochureSubmitted] = useState(false);

  const handleBrochurePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setBrochurePhone(cleaned);
  };

  const handleBrochureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brochurePhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setBrochureLoading(true);
    try {
      const res = await fetch('/api/property-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brochureName.trim(),
          phone: brochurePhone,
          requirement: `Selected Configuration: ${selectedBhk}`,
          propertyId: property._id,
          propertyTitle: property.title,
          propertyUrl: typeof window !== 'undefined' ? window.location.origin + `/properties/${property._id}` : `/properties/${property._id}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBrochureSubmitted(true);
        toast.success('Your details have been submitted. Downloading brochure...');
        
        // Trigger download of brochure
        if (property.brochureUrl) {
          const link = document.createElement('a');
          link.href = property.brochureUrl;
          link.setAttribute('download', '');
          link.setAttribute('target', '_blank');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Fallback to whatsapp if no brochure URL is uploaded
          window.open(waLink, '_blank');
        }

        setTimeout(() => {
          setShowBrochureModal(false);
          setBrochureSubmitted(false);
          setBrochureName('');
          setBrochurePhone('');
        }, 2500);
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setBrochureLoading(false);
    }
  };

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

            <Image
              src={src}
              alt=""
              fill
              className="object-cover blur-2xl opacity-40 scale-105 pointer-events-none"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 440px"
              priority={priority && idx === 0}
              loading={priority && idx === 0 ? 'eager' : 'lazy'}
              quality={40}
            />

            <Image
              src={src}
              alt={`${property.title} - Image ${idx + 1}`}
              fill
              className="object-cover md:object-contain z-10"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 440px"
              priority={priority && idx === 0}
              loading={priority && idx === 0 ? 'eager' : 'lazy'}
              quality={90}
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
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-[#1A1800] text-[10px] font-black tracking-wider rounded-md shadow-md uppercase">
            VERIFIED
          </span>
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

        {/* Dot Indicators (bottom-center) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-auto">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex
                  ? 'bg-[#C9A227] w-5'
                  : 'bg-white/70 hover:bg-white w-1.5'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── DETAILS SECTION (RIGHT) ── */}
      <div className="flex-1 p-5 md:p-6 lg:p-7 flex flex-col justify-between relative bg-white">

        {/* Top-Right Ribbon/Tag */}
        <div className="absolute top-5 right-5 z-10 shrink-0">
          <span className="px-3 py-1 bg-[#C9A227]/10 text-[#C9A227] text-[10px] font-black tracking-widest rounded-full uppercase">
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
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded text-[11px] font-black shrink-0">
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
                  <span className="text-[#B8860B] font-bold">{item.price}</span>
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
              <span className="text-[10px] font-bold text-[#C9A227] shrink-0">+{property.nearby.length - 3} more</span>
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
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Listing Agent</p>
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
              className="px-5 py-2.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] hover:brightness-105 transition-all duration-300 font-poppins font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-1.5 shadow-[0_4px_14px_rgba(201,162,39,0.25)] hover:shadow-[0_6px_20px_rgba(201,162,39,0.4)] active:scale-95"
            >
              <Eye size={13} /> View Details
            </Link>
          </div>
        </div>

      </div>

      {/* Dynamic Pop-up Brochure Form Modal */}
      <AnimatePresence>
        {showBrochureModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Dark blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!brochureLoading) setShowBrochureModal(false); }}
              className="fixed inset-0 bg-[#0B0A06]/80 backdrop-blur-md"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-[#0B0A06] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden border border-[#C9A227]/30 z-10 text-left"
            >
              {/* Image Header: Always the first image of the property/building */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                <Image 
                  src={images[0]} 
                  alt={property.title} 
                  fill
                  className="object-cover"
                  priority
                />
                {/* Dark gradient overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A06] via-[#0B0A06]/40 to-transparent" />
                
                {/* Golden horizontal line under image */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />

                {/* Title overlaid on image bottom-left */}
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-[10px] font-black text-[#E8C96A] uppercase tracking-[0.25em] block mb-1">Download Brochure</span>
                  <h3 className="text-xl font-bold text-white leading-tight font-heading bg-gradient-to-r from-[#FFE59E] via-[#E8C96A] to-[#C9A227] bg-clip-text text-transparent"
                    style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                    {property.title}
                  </h3>
                </div>
                {/* Close button inside image top-right */}
                <button 
                  onClick={() => setShowBrochureModal(false)}
                  disabled={brochureLoading}
                  className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-[#E8C96A] transition-colors flex items-center justify-center cursor-pointer border border-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content body */}
              <div className="p-6 sm:p-7">
                {brochureSubmitted ? (
                  <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-14 h-14 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.2)]">
                      <CheckCircle2 className="text-[#E8C96A] stroke-[2.5]" size={28} />
                    </div>
                    <h4 className="text-base font-extrabold text-[#E8C96A] uppercase tracking-wider">Request Submitted!</h4>
                    <p className="text-xs text-white/60 mt-2 font-medium">Your brochure download will start automatically.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBrochureSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Your full name"
                        value={brochureName}
                        onChange={(e) => setBrochureName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#C9A227]/80 text-xs font-semibold text-white outline-none transition-all placeholder:text-white/30 hover:bg-white/[0.08]"
                        required 
                        disabled={brochureLoading}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-[#C9A227]/80 bg-white/5 hover:bg-white/[0.08] transition-all">
                        <span 
                          className="px-3.5 flex items-center justify-center text-xs font-bold text-[#E8C96A] border-r border-white/10 bg-white/[0.03] select-none"
                        >
                          +91
                        </span>
                        <input 
                          type="tel" 
                          placeholder="XXXXXXXXXX"
                          value={brochurePhone}
                          onChange={(e) => handleBrochurePhoneChange(e.target.value)}
                          className="w-full px-4 py-3 bg-transparent text-xs font-semibold text-white outline-none placeholder:text-white/30"
                          required 
                          disabled={brochureLoading}
                        />
                      </div>
                    </div>

                    {/* Configuration Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Configuration Preference</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['3 BHK', '4 BHK', 'Duplex'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedBhk(opt)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                              selectedBhk === opt
                                ? 'bg-gradient-to-r from-[#C9A227] to-[#E8C96A] text-[#0B0A06] border-[#E8C96A] shadow-[0_0_10px_rgba(201,162,39,0.3)]'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/[0.08]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={brochureLoading}
                      className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-[#C9A227] via-[#E8C96A] to-[#C9A227] hover:brightness-110 text-[#0B0A06] text-xs font-extrabold uppercase tracking-widest shadow-[0_4px_20px_rgba(201,162,39,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{ backgroundSize: '200% 100%' }}
                    >
                      {brochureLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-[#0B0A06]" />
                          Downloading...
                        </>
                      ) : (
                        'Download Brochure'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </article>
  );
}
