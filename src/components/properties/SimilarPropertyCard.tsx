"use client";

import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Maximize2, ChevronRight } from 'lucide-react';
import { formatPrice, getPropertyUrl } from '@/lib/utils';
import type { Property } from '@/types';

interface SimilarPropertyCardProps {
  property: Property;
}

export default function SimilarPropertyCard({ property }: SimilarPropertyCardProps) {
  const mainImage = (property.interiorImages && property.interiorImages.length > 0)
    ? property.interiorImages[0]
    : property.images?.[0] || '/SS Realty.png';
  
  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full group transition-all duration-300 hover:shadow-md hover:border-[#C9A227]/30">
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, 260px"
          quality={90}
        />
        {/* Price Overlay */}
        <div className="absolute bottom-2 left-2">
          <div className="bg-white/90 backdrop-blur-md border border-[#C9A227]/30 px-2 py-0.5 rounded-md shadow-sm">
            <span className="text-sm font-bold text-[#C9A227]">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-[13px] sm:text-sm font-bold text-[#1A1800] mb-2 line-clamp-1 group-hover:text-[#C9A227] transition-colors leading-tight">
          {property.title}
        </h3>

        {/* Proper Configuration & Size Info */}
        {(() => {
          let configText = '';
          if (property.priceList && property.priceList.length > 0) {
            configText = property.priceList.map(item => {
              let typeStr = item.type?.replace(/(\d+)\s*(BHK)/i, '$1 BHK').trim();
              let sizeStr = item.size?.trim();
              if (sizeStr && /^[0-9\s\.,]+$/.test(sizeStr)) {
                const unit = property.features?.areaUnit === 'sqyd' ? 'Sq.Yd.' : (property.features?.areaUnit || 'Sq.Ft.');
                sizeStr = `${sizeStr} ${unit}`;
              }
              if (typeStr && sizeStr) return `${typeStr} (${sizeStr})`;
              return typeStr || sizeStr || '';
            }).filter(Boolean).join(' | ');
          } else if (property.features?.bedrooms || property.features?.area) {
            const parts = [];
            if (property.features.bedrooms) parts.push(`${property.features.bedrooms} BHK`);
            if (property.features.area) {
              const unit = property.features.areaUnit === 'sqyd' ? 'Sq.Yd.' : (property.features.areaUnit || 'Sq.Ft.');
              parts.push(`${property.features.area} ${unit}`);
            }
            configText = parts.join(' - ');
          }

          if (!configText) return null;

          return (
            <div className="mb-3 text-[11px] text-[#475569] font-medium leading-snug line-clamp-2">
              {configText}
            </div>
          );
        })()}

        {/* View Details Button */}
        <Link 
          href={getPropertyUrl(property)}
          className="mt-auto w-full py-2 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] text-[11px] sm:text-xs font-heading font-bold rounded-md text-center transition-all flex items-center justify-center gap-1 group/btn shadow-[var(--shadow-gold-sm)] hover:shadow-md hover:scale-[1.02] active:scale-95 relative overflow-hidden"
        >
          {/* SHINE EFFECT */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          <span className="relative z-10 flex items-center gap-1">
            View Details 
            <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
          </span>
        </Link>
      </div>
    </article>
  );
}
