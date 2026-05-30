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

  return <PlotPlanConfigurator property={property} existingPlan={existingPlan} />;
}
