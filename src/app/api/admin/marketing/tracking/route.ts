import { NextRequest, NextResponse } from 'next/server';
import { getTrackingSettings, updateTrackingSettings } from '@/lib/tracking-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getTrackingSettings();
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Fetch Tracking Settings Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Server-side validations
    if (body.googleTagManagerId && !/^GTM-[A-Z0-9]+$/.test(body.googleTagManagerId.trim())) {
      return NextResponse.json({ success: false, error: 'Invalid Google Tag Manager ID format (e.g. GTM-XXXXXXX)' }, { status: 400 });
    }
    if (body.metaPixelId && !/^[0-9]+$/.test(body.metaPixelId.trim())) {
      return NextResponse.json({ success: false, error: 'Meta Pixel ID must contain only numbers' }, { status: 400 });
    }
    if (body.googleAdsConversionId && !/^AW-[0-9]+$/.test(body.googleAdsConversionId.trim())) {
      return NextResponse.json({ success: false, error: 'Invalid Google Ads Conversion ID format (e.g. AW-XXXXXXXXX)' }, { status: 400 });
    }
    if (body.ga4MeasurementId && !/^G-[A-Z0-9]+$/.test(body.ga4MeasurementId.trim())) {
      return NextResponse.json({ success: false, error: 'Invalid GA4 Measurement ID format (e.g. G-XXXXXXXXXX)' }, { status: 400 });
    }

    const updatedBy = req.headers.get('x-admin-user') || 'Admin Dashboard';
    const settings = await updateTrackingSettings(body, updatedBy);

    return NextResponse.json({
      success: true,
      message: 'Tracking settings updated successfully',
      data: settings
    });
  } catch (error: any) {
    console.error('Update Tracking Settings Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
