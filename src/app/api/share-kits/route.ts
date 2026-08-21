import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ShareKit from '@/models/ShareKit';

export const dynamic = 'force-dynamic';

// Public API - for CRM Web & Flutter App
// GET /api/share-kits?slug=godrej-aristocrat  OR  ?propertyId=...
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const propertyId = searchParams.get('propertyId');

  let kit: any = null;
  if (slug) {
    kit = await ShareKit.findOne({ propertySlug: slug, isActive: true }).lean();
  } else if (propertyId) {
    kit = await ShareKit.findOne({ propertyId, isActive: true }).lean();
  } else {
    // Return all active kits (for CRM property selector)
    const kits = await ShareKit.find({ isActive: true })
      .select('propertyId propertyTitle propertySlug propertyImages propertyLocation customTagline')
      .sort('-updatedAt')
      .lean();
    return NextResponse.json({ success: true, data: kits });
  }

  if (!kit) {
    return NextResponse.json({ success: false, error: 'Share Kit not found' }, { status: 404 });
  }

  // Apply toggles - strip hidden fields
  if (!kit.toggles?.showPrice) kit.propertyPrice = null;
  if (!kit.toggles?.showBrochure) kit.propertyBrochureUrl = null;
  if (!kit.toggles?.showVideos) kit.videoLinks = [];
  if (!kit.toggles?.showPriceList) kit.propertyPriceList = [];
  if (!kit.toggles?.showPaymentPlan) kit.paymentPlans = [];
  if (!kit.toggles?.showLegalDocs) kit.legalDocs = [];
  if (!kit.toggles?.showUnitConfigs) kit.unitConfigs = [];
  if (!kit.toggles?.showAmenities) kit.propertyAmenities = [];

  return NextResponse.json({ success: true, data: kit });
}
