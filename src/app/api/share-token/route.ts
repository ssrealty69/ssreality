import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import FloorPlan from '@/models/FloorPlan';
import PlotPlan from '@/models/PlotPlan';
import ShareToken from '@/models/ShareToken';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Property ID is required' }, { status: 400 });
    }

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
        }, { status: 400 });
      }
    } else {
      floorPlan = await FloorPlan.findOne({ propertyId }).lean();
      if (!floorPlan) {
        return NextResponse.json({ 
          success: false, 
          error: 'Floor plan not configured yet for this property' 
        }, { status: 400 });
      }
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now

    const newShareToken = await ShareToken.create({
      token,
      propertyId,
      snapshot: {
        property: {
          _id: property._id.toString(),
          title: property.title,
          location: property.location,
          features: property.features,
          agent: property.agent,
          status: property.status,
          propertyType: property.propertyType
        } as any,
        floorPlan: floorPlan as any,
        plotPlan: plotPlan as any
      },
      expiresAt
    });

    return NextResponse.json({
      success: true,
      token: newShareToken.token,
      expiresAt: newShareToken.expiresAt
    });
  } catch (error) {
    console.error('Create share token error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
