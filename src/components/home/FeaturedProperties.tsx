"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import PremiumPropertyCard from '@/components/properties/PremiumPropertyCard';
import { ArrowRight } from 'lucide-react';
import type { Property } from '@/types';

interface FeaturedPropertiesProps {
  title: React.ReactNode;
  subtitle: string;
  properties: Property[];
  viewAllHref: string;
  badgeText?: string;
  className?: string;
}

export default function FeaturedProperties({
  title,
  subtitle,
  properties,
  viewAllHref,
  badgeText = "Fresh Listings",
  className = "section-padding"
}: FeaturedPropertiesProps) {
  const displayProperties = useMemo(() => {
    // Take first 4 properties
    return [...properties].slice(0, 4);
  }, [properties]);

  if (displayProperties.length === 0) return null;

  return (
    <section className={`${className} bg-[#FFFEF5]`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="text-[10px] font-black text-[#7A5C00] uppercase tracking-[0.2em]">{badgeText}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1800] mb-3 font-[var(--font-playfair)]">
            {title}
          </h2>
          <div className="w-20 h-1 bg-[#C9A227] mx-auto mb-4 rounded-full" />
          <p className="text-[#64748B] max-w-2xl mx-auto text-base">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {displayProperties.map((p) => (
            <PremiumPropertyCard key={p._id} property={p} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href={viewAllHref} className="btn-primary">
            View All Properties <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}


