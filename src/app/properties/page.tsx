import type { Metadata } from 'next';
import { Suspense } from 'react';
import PropertiesClientPage from '@/components/properties/PropertiesClientPage';

export const metadata: Metadata = {
  title: 'Properties | SS Realty',
  description: 'Browse all properties for sale and rent in Delhi NCR — apartments, villas, plots, and commercial spaces.',
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center"><span className="text-[#C9A227] text-lg">Loading properties…</span></div>}>
      <PropertiesClientPage />
    </Suspense>
  );
}
