import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FloorPlan from '@/models/FloorPlan';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await params;
    await connectDB();
    const floorPlan = await FloorPlan.findOne({ propertyId }).lean();
    
    if (!floorPlan) {
      return NextResponse.json({ success: false, error: 'Floor plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: floorPlan });
  } catch (error) {
    console.error("Get admin floor plan by propertyId error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await params;
    await connectDB();
    const body = await req.json();

    const floorPlan = await FloorPlan.findOneAndUpdate(
      { propertyId },
      body,
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ success: true, data: floorPlan });
  } catch (error) {
    console.error("Update admin floor plan error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await params;
    await connectDB();
    await FloorPlan.findOneAndDelete({ propertyId });

    return NextResponse.json({ success: true, message: 'Floor plan configuration deleted successfully' });
  } catch (error) {
    console.error("Delete admin floor plan error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
