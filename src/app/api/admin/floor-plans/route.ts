import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import FloorPlan from '@/models/FloorPlan';
import PlotPlan from '@/models/PlotPlan';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Fetch all properties
    const properties = await Property.find({}).sort('-createdAt').lean();
    
    // Fetch all configured floor plans
    const floorPlans = await FloorPlan.find({}).select('propertyId totalFloors floors').lean();
    
    // Fetch all configured plot plans
    const plotPlans = await PlotPlan.find({}).select('propertyId blocks').lean();
    
    // Map floor/plot plan info to properties
    const data = properties.map((property: any) => {
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
          location: property.location,
          propertyType: property.propertyType,
          hasFloorPlan: !!plan,
          floorPlanInfo: plan ? {
            totalFloors: plan.blocks.length, // block count is mapped to totalFloors for backward compatibility
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
        location: property.location,
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

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Fetch admin floor plans error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { propertyId, totalFloors, flatsPerFloor, floors } = body;

    if (!propertyId || !totalFloors || !floors) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const floorPlan = await FloorPlan.findOneAndUpdate(
      { propertyId },
      { totalFloors, flatsPerFloor, floors },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: floorPlan });
  } catch (error) {
    console.error("Save floor plan error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
