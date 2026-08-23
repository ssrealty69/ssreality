import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import { verifyAgentToken } from '@/lib/agentAuth';

export const dynamic = 'force-dynamic';

// GET: Return properties list for WhatsApp sharing
export async function GET(req: NextRequest) {
  const auth = await verifyAgentToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    await connectDB();
    const properties = await Property.find({ status: { $ne: 'archived' } })
      .select('title slug propertyName price priceType propertyType location brochureUrl videoUrl images highlights features')
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    const formatted = properties.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      propertyName: p.propertyName || p.title,
      slug: p.slug,
      price: p.price,
      priceType: p.priceType,
      propertyType: p.propertyType,
      city: p.location?.city,
      location: p.location?.address || p.location?.city || 'Delhi NCR',
      brochureUrl: p.brochureUrl || null,
      videoUrl: p.videoUrl || null,
      mainImage: p.images?.[0] || null,
      highlights: p.highlights || [],
      area: p.features?.area,
      areaUnit: p.features?.areaUnit,
      bedrooms: p.features?.bedrooms,
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      data: formatted,
      properties: formatted,
    });
  } catch (err: any) {
    console.error('Agent Properties GET Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
