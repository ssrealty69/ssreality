"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Bath, Maximize2, Car, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  priority?: boolean;   // Pass true for above-the-fold cards
  actionText?: string;
  onActionClick?: (property: Property) => void;
  amenitiesCount?: number;
}

export default function PropertyCard({ property, priority = false, actionText, onActionClick, amenitiesCount = 3 }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverImageError, setHoverImageError] = useState(false);
  
  const mainImage = property.images?.[0] || '/SS Realty.png';
  const hoverImage = property.images?.[1] || mainImage;
  
  const hasSecondImage = !!property.images?.[1] && !hoverImageError;

  // New Badge Logic (added in last 7 days)
  const isNew = property.createdAt && (new Date().getTime() - new Date(property.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000);
  
  // WhatsApp Link
  const waMessage = encodeURIComponent(`Hello, I am interested in ${property.title} located in ${property.location.address}, ${property.location.city}. Please share more details.`);
  const waLink = `https://wa.me/919311059100?text=${waMessage}`;

  return (
    <article 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
    >
      {/* Image Container - Ultra Compact Height */}
      <div className="relative h-44 overflow-hidden block bg-gray-100">
        {/* Main Image */}
        <Image
          src={mainImage}
          alt={`${property.title} - ${property.location.city}`}
          fill
          className={`object-cover transition-opacity duration-700 ${isHovered && hasSecondImage ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
          quality={90}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />

        {/* Hover Image — pure opacity crossfade (no scale = no blur) */}
        {property.images?.[1] && !hoverImageError && (
          <Image
            src={hoverImage}
            alt={`${property.title} - View 2`}
            fill
            className={`object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
            quality={90}
            onError={() => setHoverImageError(true)}
          />
        )}
        
        {/* New Badge (Top Left) */}
        {isNew && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-[#C2410C] text-white text-[10px] font-black rounded-md shadow-lg uppercase tracking-widest animate-bounce-slow">
              New
            </span>
          </div>
        )}

        {/* Project Badge (Top Right) */}
        <div className="absolute top-4 right-4">
          <span className="px-4 py-1 bg-[#FBBF24] text-[#1A1800] text-[12px] font-bold rounded-lg shadow-md">
            {property.title.split(' ')[0]}
          </span>
        </div>

        {/* Price Overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-4">
          <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {formatPrice(property.price)}
          </span>
        </div>
      </div>

      {/* Content - Ultra Compact Padding */}
      <div className="p-3.5 flex flex-col flex-grow">
        <h3 className="text-[17px] font-bold text-[#1A1800] mb-0.5 leading-tight line-clamp-1">
          {property.title}
        </h3>
        <p className="text-[11px] text-[#64748B] font-medium mb-2.5">
          {property.location.address}
        </p>

        {/* Specs Icons - Even more Compact */}
        {(property.features.bedrooms || property.features.bathrooms || property.features.area) ? (
          <div className="flex items-center gap-2.5 mb-3 py-1 border-y border-gray-50">
            {property.features.bedrooms ? (
              <div className="flex items-center gap-1 text-[#1E293B]">
                <BedDouble size={14} className="text-[#334155]" />
                <span className="text-xs font-semibold">{property.features.bedrooms}</span>
              </div>
            ) : null}
            {property.features.bathrooms ? (
              <div className="flex items-center gap-1 text-[#1E293B]">
                <Bath size={14} className="text-[#334155]" />
                <span className="text-xs font-semibold">{property.features.bathrooms}</span>
              </div>
            ) : null}
            {property.features.area ? (
              <div className="flex items-center gap-1 text-[#1E293B]">
                <Maximize2 size={14} className="text-[#334155]" />
                <span className="text-xs font-semibold whitespace-nowrap">
                  {property.features.area} {property.features.areaUnit === 'sqyd' ? 'Yd' : property.features.areaUnit}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Features List - Show customized count of amenities */}
        <div className="space-y-0.5 mb-4 flex-grow">
          {(property.amenities || []).slice(0, amenitiesCount).map((amenity, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#334155]">
              <Check size={11} className="text-[#059669] mt-0.5 shrink-0" />
              <span className="line-clamp-1">{amenity}</span>
            </div>
          ))}
        </div>

        {/* View Details / Custom Action Button */}
        {property.status === 'delivered' ? (
          <a 
            href={property.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.title + ', ' + property.location.address + ', ' + property.location.city)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-heading font-bold rounded-lg text-center transition-all shadow-[var(--shadow-gold-sm)] hover:shadow-md hover:scale-[1.02] active:scale-95 relative overflow-hidden block text-sm select-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            <span className="relative z-10">{actionText || 'View Location'}</span>
          </a>
        ) : onActionClick ? (
          <button 
            onClick={() => onActionClick(property)}
            className="w-full py-2.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-heading font-bold rounded-lg text-center transition-all shadow-[var(--shadow-gold-sm)] hover:shadow-md hover:scale-[1.02] active:scale-95 relative overflow-hidden block text-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            <span className="relative z-10">{actionText || 'View Details'}</span>
          </button>
        ) : (
          <Link 
            href={`/properties/${property._id}`}
            className="w-full py-2.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-heading font-bold rounded-lg text-center transition-all shadow-[var(--shadow-gold-sm)] hover:shadow-md hover:scale-[1.02] active:scale-95 relative overflow-hidden block text-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            <span className="relative z-10">{actionText || 'View Details'}</span>
          </Link>
        )}
      </div>
    </article>
  );
}
