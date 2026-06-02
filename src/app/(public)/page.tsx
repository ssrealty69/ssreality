import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import type { Property } from '@/types';
import { FALLBACK_PROPERTIES } from '@/constants/properties';

// Lazy-load below-the-fold sections — they won't block initial paint
const ProjectHighlights = dynamic(() => import('@/components/home/ProjectHighlights'), { ssr: true });
const AmenitiesSection = dynamic(() => import('@/components/home/AmenitiesSection'), { ssr: true });
const InvestmentPredictor = dynamic(() => import('@/components/home/InvestmentPredictor'), { ssr: true });
const StatsSection = dynamic(() => import('@/components/home/StatsSection'), { ssr: true });
const ServicesSection = dynamic(() => import('@/components/home/ServicesSection'), { ssr: true });
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), { ssr: true });
const DeliveredProperties = dynamic(() => import('@/components/home/DeliveredProperties'), { ssr: true });


export const metadata: Metadata = {
  title: 'SS Realty | Premium Properties in Delhi NCR',
  description: 'Discover premium residential and commercial properties for sale and rent across Delhi NCR with SS Realty — your trusted real estate partner.',
};

export const revalidate = 3600; // Cache the page for 1 hour

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
  const [latestData, apartmentData, plotData, deliveredData] = await Promise.all([
    getProperties('sort=-createdAt&limit=4&status=available'),
    getProperties('propertyType=apartment&limit=4&status=available'),
    getProperties('propertyType=plot&limit=4&status=available'),
    getProperties('limit=6&status=delivered')
  ]);

  // Fallback logic for demo/empty state
  const latestProperties = latestData.length > 0 ? latestData : FALLBACK_PROPERTIES.slice(0, 4);
  const apartments = apartmentData.length > 0 ? apartmentData : FALLBACK_PROPERTIES.filter(p => p.propertyType === 'apartment').slice(0, 4);
  const plots = plotData.length > 0 ? plotData : FALLBACK_PROPERTIES.filter(p => p.propertyType === 'plot').slice(0, 4);
  const trueDeliveredData = deliveredData.filter((p: Property) => p.status === 'delivered');
  const deliveredProperties = trueDeliveredData.length > 0 ? trueDeliveredData : [
    {
      _id: 'd1',
      title: 'Solitaire Towers',
      description: 'Ultra-exclusive residential high-rise penthouses and premium flats in the heart of Sector 50 Noida.',
      price: 19500000,
      priceType: 'sale' as const,
      propertyType: 'apartment' as const,
      status: 'delivered' as const,
      location: { address: 'Sector 50', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      features: { bedrooms: 3, bathrooms: 4, area: 2450, areaUnit: 'sqft' as const, parking: true, furnished: true },
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      amenities: [
        'Fully Handed Over & Ready to Move',
        'Premium 3 BHK Layouts with Luxury Fittings',
        'Operational Grand Clubhouse & Swimming Pool',
        'Located in Noida\'s Most Premium Sector 50'
      ],
      googleMapsUrl: 'https://maps.app.goo.gl/Fk9C2f7J5wP1aX7b9',
      agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
      views: 1250, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      _id: 'd2',
      title: 'Aura Luxury Floors',
      description: 'Pristine luxury builder floor residencies surrounded by the green valley of Gwal Pahari Gurugram.',
      price: 48000000,
      priceType: 'sale' as const,
      propertyType: 'villa' as const,
      status: 'delivered' as const,
      location: { address: 'Gwal Pahari', city: 'Gurugram', state: 'Haryana', pincode: '122003' },
      features: { bedrooms: 4, bathrooms: 5, area: 4200, areaUnit: 'sqft' as const, parking: true, furnished: true },
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      amenities: [
        'Possession and Registries Fully Completed',
        'Surrounded by Scenic Aravali Forest Covers',
        'Private Landscaped Gardens & Pool Deck',
        'Unmatched Location Linking Gurgaon & South Delhi'
      ],
      googleMapsUrl: 'https://maps.app.goo.gl/9ZpL8y3J5wP2aX8c9',
      agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
      views: 890, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      _id: 'd3',
      title: 'Cyber Plaza',
      description: 'Grade-A fully equipped commercial corporate hub delivering premium office and retail spaces in Sector 62 Noida.',
      price: 16500000,
      priceType: 'sale' as const,
      propertyType: 'commercial' as const,
      status: 'delivered' as const,
      location: { address: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201309' },
      features: { bedrooms: 0, bathrooms: 2, area: 1850, areaUnit: 'sqft' as const, parking: true },
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      amenities: [
        'Delivered Grade-A Fully Equipped Tech Towers',
        '100% Fully Occupied by Leading Corporate Firms',
        'Double-Height Grand Entrance Air-Conditioned Lobby',
        'Direct Link to NH-24 and Sector 62 Metro Hub'
      ],
      googleMapsUrl: 'https://maps.app.goo.gl/5rJ2z7K8wP3aX9d9',
      agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
      views: 450, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      _id: 'd4',
      title: 'Green Vista Farms',
      description: 'Lush gated premium residential farm plots and freehold land in South Delhi\'s finest green belt of Sultanpur.',
      price: 72000000,
      priceType: 'sale' as const,
      propertyType: 'plot' as const,
      status: 'delivered' as const,
      location: { address: 'Sultanpur', city: 'New Delhi', state: 'Delhi', pincode: '110030' },
      features: { bedrooms: 0, bathrooms: 0, area: 3600, areaUnit: 'sqyd' as const, parking: true },
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      amenities: [
        'Registry and Gated Boundaries 100% Done',
        'Premium Farmhouse Plots in Posh Green Hub',
        'Direct Proximity to Sultanpur Metro Station',
        'Surrounded by South Delhi\'s Finest Communities'
      ],
      googleMapsUrl: 'https://maps.app.goo.gl/3tK2y8L9wP4aX0e9',
      agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
      views: 1560, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      _id: 'd5',
      title: 'Gold Crest Floors',
      description: 'Ultra-luxurious spacious builder floors with state-of-the-art automation systems in Sector 50 Noida.',
      price: 24500000,
      priceType: 'sale' as const,
      propertyType: 'apartment' as const,
      status: 'delivered' as const,
      location: { address: 'Sector 50', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      features: { bedrooms: 3, bathrooms: 3, area: 2100, areaUnit: 'sqft' as const, parking: true, furnished: true },
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      amenities: [
        'Premium Woodwork and Modern Italian Kitchen',
        'Direct Access to Posh Sector 50 Central Park',
        'Dedicated Lift and 2 Stilt Parking Slots',
        '100% Occupancy & Registries Completed'
      ],
      googleMapsUrl: 'https://maps.app.goo.gl/Fk9C2f7J5wP1aX7b9',
      agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
      views: 740, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      _id: 'd6',
      title: 'Grand Corporate Plaza',
      description: 'Futuristic corporate complex with signature retail and elite business offices in Gwal Pahari Gurugram.',
      price: 32000000,
      priceType: 'sale' as const,
      propertyType: 'commercial' as const,
      status: 'delivered' as const,
      location: { address: 'Gwal Pahari', city: 'Gurugram', state: 'Haryana', pincode: '122003' },
      features: { bedrooms: 0, bathrooms: 4, area: 3200, areaUnit: 'sqft' as const, parking: true },
      images: [
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      amenities: [
        'Premium Grade-A Office Spaces & Retail Units',
        'Centrally Air-Conditioned with 100% Power Back',
        'Ample 3-Level Automated Basement Parking',
        'Strategically Linking South Delhi & Gurugram'
      ],
      googleMapsUrl: 'https://maps.app.goo.gl/9ZpL8y3J5wP2aX8c9',
      agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
      views: 1120, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What type of properties does SS Realty offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SS Realty offers a wide range of premium properties including luxury apartments, villas, residential plots, and commercial spaces primarily in the Delhi NCR region."
        }
      },
      {
        "@type": "Question",
        "name": "Are the properties listed by SS Realty verified?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all properties listed on our platform undergo a strict verification process to ensure authenticity, clear titles, and quality standards."
        }
      },
      {
        "@type": "Question",
        "name": "Can SS Realty help me with property loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. We provide consultation and assistance in securing home loans through our trusted banking partners, making your property buying experience seamless."
        }
      },
      {
        "@type": "Question",
        "name": "Does SS Realty deal in commercial real estate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we specialize in high-yield commercial real estate, offering premium office spaces and retail shops for both end-use and investment purposes."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
      <DeliveredProperties properties={deliveredProperties} />
      <TestimonialsSection />
      <InvestmentPredictor />
      <StatsSection />
      <ServicesSection />
    </>
  );
}
