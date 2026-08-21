import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';

export const dynamic = 'force-dynamic';

// This endpoint is accessible to all admin roles (not just super_admin)
// Used by Share Kits to list properties for kit creation
export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  const isAuthorized = token === 'authenticated' || secret === process.env.ADMIN_SECRET;

  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const properties = await Property.find({ status: 'available' })
      .select('title slug price location images brochureUrl highlights amenities priceList propertyName propertyType features')
      .sort('-createdAt')
      .lean();
    return NextResponse.json({ success: true, data: properties }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error fetching properties for share kits:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
