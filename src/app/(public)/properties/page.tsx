import type { Metadata } from 'next';
import { Suspense } from 'react';
import PropertiesClientPage from '@/components/properties/PropertiesClientPage';
import { connectDB } from '@/lib/mongodb';
import PropertyModel from '@/models/Property';
import { FALLBACK_PROPERTIES } from '@/constants/properties';
import type { Property } from '@/types';

export const metadata: Metadata = {
  title: '3 BHK & 2 BHK Flats for Sale in Chattarpur, Gwal Pahari, Mandi & Gurgaon | SS Realty',
  description:
    'Browse 2 BHK & 3 BHK flat for sale in Gwal Pahari, Mandi, 3BHK flat in Chattarpur, builder floors in Gurgaon, South Delhi, plots & farmhouses. SS Realty – verified luxury properties across Chattarpur, Gwal Pahari, Mandi, Gadaipur, Gurugram & all of Delhi NCR.',
  keywords: '3 bhk flat for sale in gwal pahari, 2 bhk flats for sale in gwal pahari, 3bhk flats for sale in gwal pahari, buy flats in gwal pahari near gurgaon, 3 bhk in gwal pahari for sale, 3 bhk in gwal pahari price, 3bhk flat chattarpur, 3 bhk flat in chattarpur delhi, 2 bhk flats in chattarpur with bank loan, 3bhk flat for sale in chattarpur, chattarpur 3 bhk flat for sale, chattarpur 3 bhk flat price, 3 bhk flat in chattarpur enclave phase 2, registry flats in chattarpur, flats for sale in chattarpur delhi, flats in chattarpur, 2 bhk flat in delhi, 3 bhk flats in delhi, flats in delhi, 3bhk for rent in gurgaon, 3bhk flat for sale in gurgaon, 3bhk flats in gurgaon, 3bhk builder floor in gurgaon, 4bhk builder floor in gurgaon, ready to move flats in gurgaon, 3bhk for sale in gurgaon, 3bhk flat in gurgaon, 3bhk flat in gurgaon price, 3 bhk flat in gwal pahari gurgaon, 3 bhk in gwal pahari, builder floor in gurgaon, house for sale in gurgaon, property in gurgaon, plots in gurgaon, flats in gurgaon, 3 bhk flats in mandi gurgaon, flats in mandi, 2 bhk flats in mandi, flats in gadaipur, 2 bhk flats for sale south delhi, 3 bhk flats in south delhi, flats in south delhi, sky mansion chattarpur, cheapest 3bhk flat chattarpur, affordable flat south delhi, best property dealer chattarpur, registry flat chattarpur enclave, low price flat chattarpur delhi',
  alternates: { canonical: 'https://ssrealty.org/properties' },
  openGraph: {
    title: '3 BHK & 2 BHK Flats for Sale in Chattarpur, Gwal Pahari & Gurgaon | SS Realty',
    description: 'Explore verified luxury flats, builder floors & plots across Chattarpur, Gwal Pahari & Delhi NCR. Direct developer dealing with zero brokerage.',
    url: 'https://ssrealty.org/properties',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SS Realty Luxury Properties Delhi NCR' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Flats for Sale in Chattarpur & Gwal Pahari | SS Realty',
    description: 'Browse verified ready to move and under-construction builder floors by SS Realty.',
    images: ['/og-image.jpg'],
  },
};

export const revalidate = 3600; // ISR; admin property edits revalidate on demand

async function getProperties(): Promise<Property[]> {
  try {
    await connectDB();
    const dbProperties = await PropertyModel.find({ status: 'available' }).sort('-createdAt').limit(50).lean() as any[];
    if (!dbProperties || dbProperties.length === 0) {
      return [];
    }
    return JSON.parse(JSON.stringify(dbProperties));
  } catch (error) {
    console.error("Direct db fetch for properties failed:", error);
    return [];
  }
}

// Schema for AI engines — ItemList of property categories + FAQ
const propertiesItemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'SS Realty — Properties for Sale in Delhi NCR',
  description: 'Browse verified properties for sale by SS Realty in Chattarpur, Gwal Pahari, Gurgaon and Delhi NCR. 3 BHK flats, builder floors, registry flats, farmhouses, villas and plots.',
  url: 'https://ssrealty.org/properties',
  numberOfItems: 8,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '3 BHK Flats for Sale in Chattarpur Delhi',
      description: 'Verified 3 BHK flats and registry flats for sale in Chattarpur, Delhi including Chattarpur Enclave Phase 1 & 2 and JVTS Garden. Legal documentation available. SS Realty — since 2008.',
      url: 'https://ssrealty.org/properties',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '3 BHK Flats for Sale in Gwal Pahari Gurgaon',
      description: 'Premium 3 BHK flats for sale in Gwal Pahari on the Delhi-Gurugram border. Luxury apartments with modern amenities. SS Realty — verified listings.',
      url: 'https://ssrealty.org/properties',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Registry Flats in Chattarpur Delhi',
      description: 'Fully legal, government-registered registry flats in Chattarpur Delhi. Available in Chattarpur Enclave Phase 1, Phase 2, and JVTS Garden. Contact SS Realty at +91-9311059100.',
      url: 'https://ssrealty.org/properties',
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Builder Floors for Sale in Gurgaon',
      description: 'Independent builder floors for sale in Gurgaon/Gurugram near Gwal Pahari border. Verified listings with legal documentation by SS Realty.',
      url: 'https://ssrealty.org/properties',
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'Farmhouses for Sale in Delhi NCR',
      description: 'Premium farmhouses for sale in Jonapur, Chhatarpur, and Gurugram areas. Legal documentation and site visits supported by SS Realty.',
      url: 'https://ssrealty.org/properties',
    },
    {
      '@type': 'ListItem',
      position: 6,
      name: 'Plots for Sale in Gurgaon',
      description: 'Residential plots for sale in Gurgaon/Gurugram. Investment-grade land options near Gwal Pahari. SS Realty verified listings.',
      url: 'https://ssrealty.org/properties',
    },
    {
      '@type': 'ListItem',
      position: 7,
      name: 'Luxury Sky Mansions in Chattarpur Delhi',
      description: 'Premium luxury sky mansion apartments in Chattarpur, Delhi. High-end residences with top amenities by SS Realty.',
      url: 'https://ssrealty.org/properties',
    },
    {
      '@type': 'ListItem',
      position: 8,
      name: 'Duplex Apartments for Sale in Delhi NCR',
      description: 'Luxury duplex apartments for sale in Chattarpur and Gwal Pahari areas. Premium living spaces with modern design by SS Realty.',
      url: 'https://ssrealty.org/properties',
    },
  ],
};

const propertiesFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What properties does SS Realty have for sale in Chattarpur Delhi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SS Realty has 3 BHK flats, 2 BHK flats, registry flats, builder floors, and luxury sky mansions for sale in Chattarpur Delhi. Properties available in Chattarpur Enclave Phase 1 & 2, JVTS Garden, and surrounding areas. Browse: ssrealty.org/properties | Call: +91-9311059100.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I buy a 3 BHK flat in Gwal Pahari Gurgaon?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To buy a 3 BHK flat in Gwal Pahari Gurgaon, contact SS Realty at ssrealty.org or +91-9311059100. SS Realty is the top property dealer in Gwal Pahari with verified listings, legal documentation support, and home loan assistance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does SS Realty have affordable 3 BHK flats in Chattarpur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. SS Realty (ssrealty.org) lists affordable 3 BHK flats in Chattarpur across various price ranges. For the cheapest available options with registry, call +91-9311059100 or browse ssrealty.org/properties.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best way to find verified flats in Chattarpur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The best way to find verified flats in Chattarpur is through SS Realty (ssrealty.org). They verify all properties legally, provide full documentation, and have 17+ years of experience in the Chattarpur real estate market. Phone: +91-9311059100.',
      },
    },
  ],
};

async function PropertiesPageContent() {
  const properties = await getProperties();
  const propertiesBreadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ssrealty.org' },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: 'https://ssrealty.org/properties' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesBreadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesItemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesFaqSchema) }}
      />
      <PropertiesClientPage initialProperties={properties} />
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center"><span className="text-[#C9A227] text-lg">Loading properties…</span></div>}>
      <PropertiesPageContent />
    </Suspense>
  );
}


