import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ShareKit from '@/models/ShareKit';
import Property from '@/models/Property';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

// GET: List all share kits (or single by propertyId query param)
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId');

  if (propertyId) {
    const kit = await ShareKit.findOne({ propertyId }).lean();
    return NextResponse.json({ success: true, data: kit });
  }

  const kits = await ShareKit.find({}).sort('-updatedAt').lean();
  return NextResponse.json({ success: true, data: kits });
}

// POST: Create or update share kit for a property (upsert)
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const { propertyId } = body;
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId is required' }, { status: 400 });
    }

    // Auto-sync property data
    const property = await Property.findById(propertyId).lean() as any;
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    const syncedData = {
      propertyTitle: property.title || '',
      propertySlug: property.slug || '',
      propertyPrice: property.price || 0,
      propertyLocation: `${property.location?.address || ''}, ${property.location?.city || ''}`.trim().replace(/^,\s*/, ''),
      propertyImages: property.images || [],
      propertyBrochureUrl: property.brochureUrl || '',
      propertyHighlights: property.highlights || [],
      propertyAmenities: property.amenities || [],
      propertyPriceList: property.priceList || [],
    };

    const updateData = { ...syncedData, ...body };
    delete updateData._id;

    const kit = await ShareKit.findOneAndUpdate(
      { propertyId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: kit });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a share kit
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
  await connectDB();
  await ShareKit.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
