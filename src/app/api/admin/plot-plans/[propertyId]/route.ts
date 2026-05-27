import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import PlotPlan from '@/models/PlotPlan';

export const dynamic = 'force-dynamic';

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

    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    const plotPlan = await PlotPlan.findOne({ propertyId }).lean();

    return NextResponse.json({
      success: true,
      data: {
        property,
        plotPlan: plotPlan || null
      }
    });
  } catch (error) {
    console.error("Fetch admin plot plan error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(
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
    const { blocks } = body;

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json({ success: false, error: 'Invalid data format. Blocks array is required.' }, { status: 400 });
    }

    const updatedPlan = await PlotPlan.findOneAndUpdate(
      { propertyId },
      { blocks },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: updatedPlan });
  } catch (error) {
    console.error("Save admin plot plan error:", error);
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

    await PlotPlan.findOneAndDelete({ propertyId });

    return NextResponse.json({ success: true, message: 'Plot plan cleared successfully' });
  } catch (error) {
    console.error("Delete admin plot plan error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
