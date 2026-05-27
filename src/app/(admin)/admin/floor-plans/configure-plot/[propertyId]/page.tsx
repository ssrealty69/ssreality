import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import PlotPlan from '@/models/PlotPlan';
import PlotPlanConfigurator from '@/components/admin/PlotPlanConfigurator';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ConfigurePlotPlan({
  params
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params;
  let property: any = null;
  let existingPlan: any = null;
  let errorMsg = '';

  try {
    await connectDB();
    const rawProperty = await Property.findById(propertyId).lean();
    if (!rawProperty) {
      errorMsg = 'Property not found';
    } else {
      property = JSON.parse(JSON.stringify(rawProperty));
      
      const rawPlan = await PlotPlan.findOne({ propertyId }).lean();
      if (rawPlan) {
        existingPlan = JSON.parse(JSON.stringify(rawPlan));
      }
    }
  } catch (error) {
    console.error("Fetch plot configurator data error:", error);
    errorMsg = 'Failed to retrieve data from database';
  }

  if (errorMsg || !property) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 p-4 border border-red-100 rounded-2xl text-red-700 text-sm">
          {errorMsg || 'An error occurred while loading property details.'}
        </div>
        <Link href="/admin/floor-plans" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#C9A227]">
          <ArrowLeft size={16} />
          <span>Back to Floor Plans list</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/floor-plans" 
          className="p-2 bg-white border border-gray-100 hover:border-[#C9A227]/30 text-gray-600 hover:text-[#C9A227] rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1800]">Configure Plotting Layout Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">Property: <strong className="text-gray-700">{property.title}</strong></p>
        </div>
      </div>

      <PlotPlanConfigurator property={property} existingPlan={existingPlan} />
    </div>
  );
}
