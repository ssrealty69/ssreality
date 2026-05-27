import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import FloorPlan from '@/models/FloorPlan';
import PlotPlan from '@/models/PlotPlan';
import FloorPlansTable from '@/components/admin/FloorPlansTable';
import PasscodeManager from '@/components/admin/PasscodeManager';

export const dynamic = 'force-dynamic';

export default async function AdminFloorPlans() {
  let data: any[] = [];
  let dbError = false;

  try {
    await connectDB();
    const properties = await Property.find({}).sort('-createdAt').lean();
    const floorPlans = await FloorPlan.find({}).lean();
    const plotPlans = await PlotPlan.find({}).lean();

    data = properties.map((property: any) => {
      const isPlot = property.propertyType?.toLowerCase() === 'plot';
      
      if (isPlot) {
        const plan = plotPlans.find(pp => pp.propertyId.toString() === property._id.toString());
        
        let totalPlotsCount = 0;
        let soldPlotsCount = 0;
        let reservedPlotsCount = 0;
        
        if (plan) {
          plan.blocks.forEach(block => {
            block.plots.forEach(plot => {
              totalPlotsCount++;
              if (plot.status === 'sold') soldPlotsCount++;
              else if (plot.status === 'reserved') reservedPlotsCount++;
            });
          });
        }
        
        return {
          _id: property._id.toString(),
          title: property.title,
          location: {
            address: property.location.address,
            city: property.location.city,
          },
          propertyType: property.propertyType,
          hasFloorPlan: !!plan,
          floorPlanInfo: plan ? {
            totalFloors: plan.blocks.length, // block count
            totalUnits: totalPlotsCount,
            soldUnits: soldPlotsCount,
            reservedUnits: reservedPlotsCount,
            availableUnits: totalPlotsCount - soldPlotsCount - reservedPlotsCount,
            isPlotLayout: true
          } : null
        };
      }

      const plan = floorPlans.find(fp => fp.propertyId.toString() === property._id.toString());
      
      let totalUnitsCount = 0;
      let soldUnitsCount = 0;
      let reservedUnitsCount = 0;
      
      if (plan) {
        plan.floors.forEach(floor => {
          floor.flats.forEach(flat => {
            totalUnitsCount++;
            if (flat.status === 'sold') soldUnitsCount++;
            else if (flat.status === 'reserved') reservedUnitsCount++;
          });
        });
      }
      
      return {
        _id: property._id.toString(),
        title: property.title,
        location: {
          address: property.location.address,
          city: property.location.city,
        },
        propertyType: property.propertyType,
        hasFloorPlan: !!plan,
        floorPlanInfo: plan ? {
          totalFloors: plan.totalFloors,
          totalUnits: totalUnitsCount,
          soldUnits: soldUnitsCount,
          reservedUnits: reservedUnitsCount,
          availableUnits: totalUnitsCount - soldUnitsCount - reservedUnitsCount
        } : null
      };
    });
  } catch (error) {
    console.error("Fetch floor plans admin dashboard error:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#1A1800]">Floor Plans Availability Tracker</h1>
          <p className="text-sm text-gray-500">Configure floor-by-floor unit sales and share visual plans with your clients</p>
        </div>
        <PasscodeManager />
      </div>

      {dbError && (
        <div className="bg-red-50 p-4 border border-red-100 rounded-2xl flex items-center gap-2 text-red-700 text-sm">
          <strong>Database Error:</strong> Could not load properties or floor plans. Please check your network connection.
        </div>
      )}

      <FloorPlansTable initialProperties={data} />
    </div>
  );
}
