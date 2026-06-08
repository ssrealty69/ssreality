'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AmenityImageProps {
  src: string;
  alt: string;
  fallbackText: string;
}

function AmenityImage({ src, alt, fallbackText }: AmenityImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <span className="text-[#C9A227] text-3xl font-bold">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  );
}

export function ProjectAmenitiesGrid({ amenities = [] }: { amenities?: string[] }) {
  if (!amenities || amenities.length === 0) return null;

  const total = amenities.length;
  // Calculate columns based on 3 rows: total / 3. Fallback to ceil if not divisible.
  const cols = Math.min(8, Math.max(3, total % 3 === 0 ? total / 3 : Math.ceil(total / 3)));

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-[repeat(var(--cols),_minmax(0,_1fr))] gap-4 sm:gap-6"
      style={{ '--cols': cols } as React.CSSProperties}
    >
      {amenities.map((amenity: string, idx: number) => (
        <div
          key={idx}
          className="group bg-white rounded-2xl overflow-hidden border border-gray-100/70 shadow-md hover:shadow-[0_15px_30px_-5px_rgba(201,162,39,0.15)] hover:scale-[1.03] transition-all duration-300 flex flex-col"
        >
          <div className="relative h-28 sm:h-32 overflow-hidden bg-gray-100">
            <AmenityImage
              src={`/Project Amenities/${amenity}.jpg`}
              alt={amenity}
              fallbackText="✦"
            />
          </div>
          <div className="bg-[#1A1800] border-t border-[#C9A227]/25 px-2 sm:px-3 h-10 sm:h-12 flex items-center justify-center text-center">
            <span className="text-[9px] sm:text-[11px] font-black text-[#F0D060] uppercase tracking-wide leading-tight line-clamp-2 block">
              {amenity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorldClassAmenitiesGrid({ amenities = [] }: { amenities?: string[] }) {
  if (!amenities || amenities.length === 0) return null;

  const total = amenities.length;
  const cols = Math.min(8, Math.max(3, total % 3 === 0 ? total / 3 : Math.ceil(total / 3)));

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-[repeat(var(--cols),_minmax(0,_1fr))] gap-4 sm:gap-6"
      style={{ '--cols': cols } as React.CSSProperties}
    >
      {amenities.map((amenity: string, idx: number) => (
        <div
          key={idx}
          className="group bg-white rounded-2xl overflow-hidden border border-gray-100/70 shadow-md hover:shadow-[0_15px_30px_-5px_rgba(201,162,39,0.15)] hover:scale-[1.03] transition-all duration-300 flex flex-col"
        >
          <div className="relative h-28 sm:h-32 overflow-hidden bg-gray-100">
            <AmenityImage
              src={`/World Class Amenities/${amenity}.jpg`}
              alt={amenity}
              fallbackText="★"
            />
          </div>
          <div className="bg-gradient-to-r from-[#C9A227] to-[#B8860B] border-t border-[#1A1800]/10 px-2 sm:px-3 h-10 sm:h-12 flex items-center justify-center text-center">
            <span className="text-[9px] sm:text-[11px] font-black text-[#1A1800] uppercase tracking-wide leading-tight line-clamp-2 block">
              {amenity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Default export for backward compatibility
export default function AmenitiesGrid({ amenities = [] }: { amenities?: string[] }) {
  return <ProjectAmenitiesGrid amenities={amenities} />;
}
