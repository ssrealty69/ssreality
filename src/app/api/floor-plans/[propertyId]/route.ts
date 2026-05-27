import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import FloorPlan from '@/models/FloorPlan';
import PlotPlan from '@/models/PlotPlan';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    await connectDB();
    
    const property = await Property.findById(propertyId).select('title location features agent status propertyType').lean();

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    const isPlot = property.propertyType?.toLowerCase() === 'plot';
    let floorPlan = null;
    let plotPlan = null;

    if (isPlot) {
      plotPlan = await PlotPlan.findOne({ propertyId }).lean();
      if (!plotPlan) {
        return NextResponse.json({ 
          success: false, 
          error: 'Plotting map not configured yet for this property' 
        }, { status: 404 });
      }
    } else {
      floorPlan = await FloorPlan.findOne({ propertyId }).lean();
      if (!floorPlan) {
        return NextResponse.json({ 
          success: false, 
          error: 'Floor plan not configured yet for this property' 
        }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        property: {
          _id: property._id.toString(),
          title: property.title,
          location: property.location,
          features: property.features,
          agent: property.agent,
          status: property.status,
          propertyType: property.propertyType
        },
        floorPlan,
        plotPlan
      }
    });
  } catch (error) {
    console.error("Public floor/plot plan GET error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
