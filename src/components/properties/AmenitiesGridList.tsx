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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {amenities.map((amenity: string, idx: number) => (
        <div
          key={idx}
          className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <div className="relative h-32 overflow-hidden bg-gray-100">
            <AmenityImage
              src={`/Project Amenities/${amenity}.jpg`}
              alt={amenity}
              fallbackText="✦"
            />
          </div>
          <div className="bg-[#1A1800] px-3 py-2 text-center">
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {amenities.map((amenity: string, idx: number) => (
        <div
          key={idx}
          className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <div className="relative h-32 overflow-hidden bg-gray-100">
            <AmenityImage
              src={`/World Class Amenities/${amenity}.jpg`}
              alt={amenity}
              fallbackText="★"
            />
          </div>
          <div className="bg-gradient-to-r from-[#C9A227] to-[#B8860B] px-3 py-2 text-center">
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
