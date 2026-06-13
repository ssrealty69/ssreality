import { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import FloorPlan from '@/models/FloorPlan';
import PlotPlan from '@/models/PlotPlan';
import FloorViewClient from './FloorViewClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Secure Floor Plan Console',
  description: 'Request secure access to premium property floor plans in Gurgaon and Delhi NCR.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FloorViewPage() {
  let propertiesWithPlans: any[] = [];
  let dbError = false;

  try {
    await connectDB();
    
    // Fetch all configured floor and plot plans to populate the selector dropdown
    const [allFloorPlans, allPlotPlans] = await Promise.all([
      FloorPlan.find({}).select('propertyId').lean(),
      PlotPlan.find({}).select('propertyId').lean()
    ]);
    
    const planIds = [
      ...allFloorPlans.map(p => p.propertyId),
      ...allPlotPlans.map(p => p.propertyId)
    ];
    
    const rawProps = await Property.find({ _id: { $in: planIds } }).select('title location propertyType').lean();
    propertiesWithPlans = JSON.parse(JSON.stringify(rawProps)).map((p: any) => ({
      _id: p._id.toString(),
      title: p.title,
      location: p.location,
      propertyType: p.propertyType,
    }));
  } catch (error) {
    console.error("Fetch properties with plans for console error:", error);
    dbError = true;
  }

  return (
    <FloorViewClient 
      availableProperties={propertiesWithPlans} 
      dbError={dbError} 
    />
  );
}
