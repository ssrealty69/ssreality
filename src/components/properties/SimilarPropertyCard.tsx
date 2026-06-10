"use client";

import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Maximize2, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
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
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
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
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-sm sm:text-base font-bold text-[#1A1800] mb-2 line-clamp-1 group-hover:text-[#C9A227] transition-colors">
          {property.title}
        </h3>

        {/* Minimal Specs */}
        {(property.features.bedrooms || property.features.area) ? (
          <div className="grid grid-cols-1 gap-1.5 mb-3 sm:mb-4">
            {property.features.bedrooms ? (
              <div className="flex items-center gap-1.5 text-gray-500">
                <BedDouble size={14} className="text-[#C9A227]" />
                <span className="text-[11px] sm:text-[13px] font-medium">{property.features.bedrooms} BHK</span>
              </div>
            ) : null}
            {property.features.area ? (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Maximize2 size={14} className="text-[#C9A227]" />
                <span className="text-[11px] sm:text-[13px] font-medium line-clamp-1">
                  {property.features.area} {property.features.areaUnit === 'sqyd' ? 'Sq. Yd' : property.features.areaUnit}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* View Details Button */}
        <Link 
          href={`/properties/${property._id}`}
          className="mt-auto w-full py-2.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] text-[12px] sm:text-sm font-heading font-bold rounded-lg text-center transition-all flex items-center justify-center gap-1 group/btn shadow-[var(--shadow-gold-sm)] hover:shadow-md hover:scale-[1.02] active:scale-95 relative overflow-hidden"
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
