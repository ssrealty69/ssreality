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

// PATCH: Sync property data into share kit (re-fetch from website property)
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const { id } = await context.params;
    const kit = await ShareKit.findById(id);
    if (!kit) return NextResponse.json({ success: false, error: 'Kit not found' }, { status: 404 });

    const property = await Property.findById(kit.propertyId).lean() as any;
    if (!property) return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });

    kit.propertyTitle = property.title || '';
    kit.propertySlug = property.slug || '';
    kit.propertyPrice = property.price || 0;
    kit.propertyLocation = `${property.location?.address || ''}, ${property.location?.city || ''}`.trim().replace(/^,\s*/, '');
    kit.propertyImages = property.images || [];
    kit.propertyBrochureUrl = property.brochureUrl || '';
    kit.propertyHighlights = property.highlights || [];
    kit.propertyAmenities = property.amenities || [];
    kit.propertyPriceList = property.priceList || [];
    await kit.save();

    return NextResponse.json({ success: true, data: kit });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
