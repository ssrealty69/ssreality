import type { Metadata } from 'next';
import { Suspense } from 'react';
import PropertiesClientPage from '@/components/properties/PropertiesClientPage';
import { connectDB } from '@/lib/mongodb';
import PropertyModel from '@/models/Property';
import { FALLBACK_PROPERTIES } from '@/constants/properties';
import type { Property } from '@/types';

export const metadata: Metadata = {
  title: 'Properties | SS Realty',
  description: 'Browse all properties for sale and rent in Delhi NCR — apartments, villas, plots, and commercial spaces.',
};

export const dynamic = 'force-dynamic';

async function getProperties(): Promise<Property[]> {
  try {
    await connectDB();
    const dbProperties = await PropertyModel.find({ status: 'available' }).sort('-createdAt').limit(50).lean() as any[];
    if (!dbProperties || dbProperties.length === 0) {
      return JSON.parse(JSON.stringify(FALLBACK_PROPERTIES));
    }
    return JSON.parse(JSON.stringify(dbProperties));
  } catch (error) {
    console.error("Direct db fetch for properties failed:", error);
    return JSON.parse(JSON.stringify(FALLBACK_PROPERTIES));
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


