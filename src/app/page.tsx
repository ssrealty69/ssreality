import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import type { Property } from '@/types';
import { FALLBACK_PROPERTIES } from '@/constants/properties';

// Lazy-load below-the-fold sections — they won't block initial paint
const ProjectHighlights = dynamic(() => import('@/components/home/ProjectHighlights'), { ssr: true });
const AmenitiesSection = dynamic(() => import('@/components/home/AmenitiesSection'), { ssr: true });
const StatsSection = dynamic(() => import('@/components/home/StatsSection'), { ssr: true });
const ServicesSection = dynamic(() => import('@/components/home/ServicesSection'), { ssr: true });
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), { ssr: true });
const CTASection = dynamic(() => import('@/components/home/CTASection'), { ssr: true });

export const metadata: Metadata = {
  title: 'SS Realty | Premium Properties in Delhi NCR',
  description: 'Discover premium residential and commercial properties for sale and rent across Delhi NCR with SS Realty — your trusted real estate partner.',
};

// ISR — revalidate every hour
export const revalidate = 3600;

async function getProperties(query: string): Promise<Property[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/properties?${query}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  // Fetch data for different sections
  const [latestData, apartmentData, plotData] = await Promise.all([
    getProperties('sort=-createdAt&limit=4&status=available'),
    getProperties('propertyType=apartment&limit=4&status=available'),
    getProperties('propertyType=plot&limit=4&status=available')
  ]);

  // Fallback logic for demo/empty state
  const latestProperties = latestData.length > 0 ? latestData : FALLBACK_PROPERTIES.slice(0, 4);
  const apartments = apartmentData.length > 0 ? apartmentData : FALLBACK_PROPERTIES.filter(p => p.propertyType === 'apartment').slice(0, 4);
  const plots = plotData.length > 0 ? plotData : FALLBACK_PROPERTIES.filter(p => p.propertyType === 'plot').slice(0, 4);

  return (
    <>
      <HeroSection />
      
      {/* 1. Newly Added Section */}
      <FeaturedProperties 
        title={<>Newly Added <span className="text-[#C9A227]">Properties</span></>}
        subtitle="Stay ahead with the latest residential and commercial opportunities recently posted by our expert team."
        properties={latestProperties}
        viewAllHref="/properties?sortBy=newest"
        badgeText="Fresh Listings"
        className="pt-12 pb-6 md:pt-16 md:pb-8"
      />

      {/* 2. Luxury Apartments Section */}
      <FeaturedProperties 
        title={<>Luxury <span className="text-[#C9A227]">Apartments</span></>}
        subtitle="Discover premium flats and high-rise apartments designed for a modern and sophisticated lifestyle."
        properties={apartments}
        viewAllHref="/properties?propertyType=apartment"
        badgeText="Urban Living"
        className="py-6 md:py-8"
      />

      {/* 3. Freehold Lands Section */}
      <FeaturedProperties 
        title={<>Freehold <span className="text-[#C9A227]">Lands & Plots</span></>}
        subtitle="Build your dream home on our premium residential and freehold plots in strategic locations across NCR."
        properties={plots}
        viewAllHref="/properties?propertyType=plot"
        badgeText="Investment Gold"
        className="pt-6 pb-12 md:pt-8 md:pb-16"
      />

      <ProjectHighlights />
      <AmenitiesSection />
      <StatsSection />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
