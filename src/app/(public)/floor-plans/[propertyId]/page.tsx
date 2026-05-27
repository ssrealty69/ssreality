import { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import FloorPlan from '@/models/FloorPlan';
import PlotPlan from '@/models/PlotPlan';
import ClientFloorPlanViewer from '@/components/public/ClientFloorPlanViewer';
import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

// SEO Shielding: Block all search engines from indexing or crawling this page
export const metadata: Metadata = {
  title: 'Live Floor Plan & Plot availability Tracker - SS Realty',
  description: 'View real-time configurations and availability status.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PublicFloorPlanPage({
  params
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params;
  let property: any = null;
  let floorPlan: any = null;
  let plotPlan: any = null;
  let errorMsg = '';
  let propertiesWithPlans: any[] = [];

  try {
    await connectDB();
    const rawProperty = await Property.findById(propertyId).select('title location features agent status propertyType').lean();
    
    if (!rawProperty) {
      errorMsg = 'Property not found';
    } else {
      property = JSON.parse(JSON.stringify(rawProperty));
      
      const isPlot = property.propertyType?.toLowerCase() === 'plot';
      
      if (isPlot) {
        const rawPlan = await PlotPlan.findOne({ propertyId }).lean();
        if (!rawPlan) {
          errorMsg = 'Plotting layout map has not been configured for this property yet.';
        } else {
          plotPlan = JSON.parse(JSON.stringify(rawPlan));
        }
      } else {
        const rawPlan = await FloorPlan.findOne({ propertyId }).lean();
        if (!rawPlan) {
          errorMsg = 'Floor plan availability has not been configured for this building yet.';
        } else {
          floorPlan = JSON.parse(JSON.stringify(rawPlan));
        }
      }
      
      if (!errorMsg) {
        // Fetch all configured floor plans & plot plans to populate the switcher dropdown
        const [allFloorPlans, allPlotPlans] = await Promise.all([
          FloorPlan.find({}).select('propertyId').lean(),
          PlotPlan.find({}).select('propertyId').lean()
        ]);
        
        const planIds = [
          ...allFloorPlans.map(p => p.propertyId),
          ...allPlotPlans.map(p => p.propertyId)
        ];
        
        const rawProps = await Property.find({ _id: { $in: planIds } }).select('title location').lean();
        propertiesWithPlans = JSON.parse(JSON.stringify(rawProps)).map((p: any) => ({
          _id: p._id.toString(),
          title: p.title,
          location: p.location,
        }));
      }
    }
  } catch (error) {
    console.error("Fetch public floor/plot plan error:", error);
    errorMsg = 'Database connection error. Please refresh or try again later.';
  }

  if (errorMsg || !property || (!floorPlan && !plotPlan)) {
    return (
      <div className="min-h-screen bg-[#FDFDFB] text-gray-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#C9A227]" />
          <div className="w-16 h-16 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(201,162,39,0.1)]">
            <AlertTriangle size={32} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-800 font-[var(--font-playfair)]">Availability Status</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              {errorMsg || 'The visual availability layout is not currently online.'}
            </p>
          </div>

          <div className="pt-2">
            <Link 
              href="/" 
              className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Home size={16} className="text-[#C9A227]" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientFloorPlanViewer 
      property={property} 
      floorPlan={floorPlan} 
      plotPlan={plotPlan}
      availableProperties={propertiesWithPlans} 
    />
  );
}
