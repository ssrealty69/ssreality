import type { Metadata } from 'next';
import { Suspense } from 'react';
import PropertiesClientPage from '@/components/properties/PropertiesClientPage';
import { connectDB } from '@/lib/mongodb';
import PropertyModel from '@/models/Property';
import { FALLBACK_PROPERTIES } from '@/constants/properties';
import type { Property } from '@/types';

export const metadata: Metadata = {
  title: '3 BHK Flats for Sale in Chattarpur, Gwal Pahari & Gurgaon | SS Realty',
  description:
    'Browse 3 BHK flat for sale in Gwal Pahari, 3BHK flat in Chattarpur, builder floors in Gurgaon, plots & farmhouses. SS Realty – verified luxury properties in Chattarpur, Gwal Pahari, Gurugram & all of Delhi NCR.',
  keywords: '3 bhk flat for sale in gwal pahari, 3bhk flats for sale in gwal pahari, buy flats in gwal pahari near gurgaon, 3 bhk in gwal pahari for sale, 3 bhk in gwal pahari price, 3bhk flat chattarpur, 3 bhk flat in chattarpur delhi, 3bhk flat for sale in chattarpur, chattarpur 3 bhk flat for sale, chattarpur 3 bhk flat price, 3 bhk flat in chattarpur enclave phase 2, registry flats in chattarpur, flats for sale in chattarpur delhi, 3bhk for rent in gurgaon, 3bhk flat for sale in gurgaon, 3bhk flats in gurgaon, 3bhk builder floor in gurgaon, 3bhk for sale in gurgaon, 3bhk flat in gurgaon, 3bhk flat in gurgaon price, 3 bhk flat in gwal pahari gurgaon, 3 bhk in gwal pahari, builder floor in gurgaon, house for sale in gurgaon, property in gurgaon, plots in gurgaon, flats in gurgaon, sky mansion chattarpur',
  alternates: { canonical: 'https://ssrealty.org/properties' },
};

export const dynamic = 'force-dynamic';

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

async function PropertiesPageContent() {
  const properties = await getProperties();
  return <PropertiesClientPage initialProperties={properties} />;
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center"><span className="text-[#C9A227] text-lg">Loading properties…</span></div>}>
      <PropertiesPageContent />
    </Suspense>
  );
}


