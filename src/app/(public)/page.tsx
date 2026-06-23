import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import type { Property } from '@/types';
import { FALLBACK_PROPERTIES } from '@/constants/properties';
import { connectDB } from '@/lib/mongodb';
import PropertyModel from '@/models/Property';

// Lazy-load below-the-fold sections
const ProjectHighlights   = dynamic(() => import('@/components/home/ProjectHighlights'));
const AmenitiesSection    = dynamic(() => import('@/components/home/AmenitiesSection'));
const InvestmentPredictor = dynamic(() => import('@/components/home/InvestmentPredictor'));


const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'));
const DeliveredProperties = dynamic(() => import('@/components/home/DeliveredProperties'));
const FarmHouseSection    = dynamic(() => import('@/components/home/FarmHouseSection'));


export const metadata: Metadata = {
  title: 'Luxury Homes & Flat for sale in Chattarpur, Gwal Pahari, Gurgaon and Delhi NCR',
  description:
    'Find 3 BHK flat in Gwal Pahari, 3BHK flat in Chattarpur, builder floor in Gurgaon, flats for sale in Delhi NCR. SS Realty – your trusted real estate partner since 2008 for luxury homes, apartments, villas, plots & farmhouses across Chattarpur, Gwal Pahari, Gurugram and all of Delhi NCR.',
  keywords: '3 bhk flat for sale in gwal pahari, 3bhk flats for sale in gwal pahari, buy flats in gwal pahari near gurgaon, 3 bhk in gwal pahari for sale, 3 bhk in gwal pahari price, 3bhk flat chattarpur, 3bhk flat in chattarpur for rent, 3 bhk flat in chattarpur for rent, 3 bhk flat in chattarpur delhi, 3bhk flat in jvts chattarpur, 3bhk flat for sale in chattarpur, chattarpur 3 bhk flat for sale, chattarpur 3 bhk flat price, 3 bhk flat in chattarpur enclave phase 2, 3 bhk flat chhatarpur, sky mansion chattarpur, flats 3bhk, three bhk flat, 3 bhk in chattarpur for sale, 3 bhk apartment for sale, 3 bhk flats in delhi, 3 bk in chattarpur enclave, registry flats in chattarpur, flats for sale in chattarpur delhi, flats in chattarpur for rent, 3bhk for rent in gurgaon, 3bhk gurgaon, 3bhk flat for sale in gurgaon, 3bhk flats in gurgaon, 3bhk builder floor in gurgaon, 3bhk for sale in gurgaon, 3bhk flat for rent in gurgaon, 3bhk flat in gurgaon, 3bhk flat on rent near me, 3bhk flat in gurgaon price, 3bhk flat, 3 bhk flat in gwal pahari gurgaon, 3 bhk in gwal pahari, builder floor in gurgaon, house for sale in gurgaon, property in gurgaon, plots in gurgaon, flats in gurgaon, ss realty chattarpur, ss realty jonapur',
  alternates: { canonical: 'https://ssrealty.org' },
};

export const revalidate = 3600; // Cache the page for 1 hour

export default async function HomePage() {
  let latestData: any[] = [];
  let plotData: any[] = [];
  let deliveredData: any[] = [];

  try {
    await connectDB();
    const [latestRaw, plotRaw, deliveredRaw] = await Promise.all([
      PropertyModel.find({ status: 'available' }).sort('-createdAt').limit(6).lean(),
      PropertyModel.find({ propertyType: 'plot', status: 'available' }).sort('-createdAt').limit(6).lean(),
      PropertyModel.find({ status: 'delivered' }).sort('-createdAt').limit(6).lean(),
    ]);

    latestData = JSON.parse(JSON.stringify(latestRaw));
    plotData = JSON.parse(JSON.stringify(plotRaw));
    deliveredData = JSON.parse(JSON.stringify(deliveredRaw));
  } catch (error) {
    console.error("Error fetching homepage data directly from MongoDB:", error);
  }

  // Only show properties that are actually listed in the database (no fallbacks to mock properties)
  const latestProperties = latestData;
  const plots = plotData;
  const trueDeliveredData = deliveredData.filter((p: Property) => p.status === 'delivered');
  const deliveredProperties = trueDeliveredData;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ssrealty.org' },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: 'https://ssrealty.org/properties' },
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where can I find 3 BHK flat for sale in Gwal Pahari?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SS Realty offers verified 3 BHK flats for sale in Gwal Pahari near Gurgaon border. Our listings include luxury apartments with premium amenities at competitive prices. Visit ssrealty.org or call +91-9311059100."
        }
      },
      {
        "@type": "Question",
        "name": "What is the price of 3 BHK flat in Gwal Pahari Gurgaon?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "3 BHK flat prices in Gwal Pahari Gurgaon typically range from ₹80 lakhs to ₹2.5 crore depending on size, floor, and amenities. SS Realty has exclusive listings in Gwal Pahari with registry available. Contact us at +91-9311059100 for exact pricing."
        }
      },
      {
        "@type": "Question",
        "name": "Are there registry flats available in Chattarpur Delhi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! SS Realty specializes in registry flats in Chattarpur Delhi including Chattarpur Enclave Phase 1 & 2 and JVTS Garden. We have verified listings of 3 BHK flats for sale in Chattarpur with full legal documentation and registry available."
        }
      },
      {
        "@type": "Question",
        "name": "Does SS Realty offer builder floors in Gurgaon?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, SS Realty offers premium builder floors in Gurgaon and 3 BHK flats across Gurgaon. Our portfolio includes properties in sectors near Gwal Pahari border. We also have plots in Gurgaon for investment."
        }
      },
      {
        "@type": "Question",
        "name": "What type of properties does SS Realty offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SS Realty offers a wide range of premium properties including 3 BHK luxury flats in Gwal Pahari and Chattarpur, builder floors in Gurgaon, farmhouses, villas, residential plots, commercial spaces, and lands across Delhi NCR."
        }
      },
      {
        "@type": "Question",
        "name": "Where is SS Realty office located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SS Realty office is located at Plot No-2, Dalmia Farm, Jonapur, New Delhi, Delhi 110047. Previously in Chattarpur, our new office is in Jonapur. Contact: +91-9311059100 or info@ssrealty.org."
        }
      },
      {
        "@type": "Question",
        "name": "Can SS Realty help me with property loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. We provide consultation and assistance in securing home loans through our trusted banking partners, making your property buying experience in Gwal Pahari, Chattarpur, and Gurgaon seamless."
        }
      },
      {
        "@type": "Question",
        "name": "Does SS Realty deal in commercial real estate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we specialize in high-yield commercial real estate across Delhi NCR, offering premium office spaces, retail shops, and commercial plots in Gurgaon, Noida, and South Delhi for both end-use and investment."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroSection />
      
      {/* 1. Featured Properties Section */}
      <FeaturedProperties 
        title={<>Handpicked <span className="bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] bg-clip-text text-transparent">Masterpieces</span></>}
        subtitle="Discover our handpicked selection of premium residential and commercial properties tailored for you."
        properties={latestProperties}
        viewAllHref="/properties"
        badgeText="Featured Properties"
        className="pt-12 pb-6 md:pt-16 md:pb-8"
      />



      <FarmHouseSection />

      <ProjectHighlights />
      <AmenitiesSection />
      <DeliveredProperties properties={deliveredProperties} />
      <TestimonialsSection />
      <InvestmentPredictor />


    </>
  );
}
