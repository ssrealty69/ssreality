import { NextRequest, NextResponse } from 'next/server';
import { getTrackingSettings } from '@/lib/tracking-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getTrackingSettings();
    
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Tracking configurations not found' }, { status: 404 });
    }

    if (!settings.isEnabled) {
      return NextResponse.json({
        success: false,
        message: 'Global tracking is disabled. Enable it before running the test.'
      });
    }

    // Diagnostics payload
    return NextResponse.json({
      success: true,
      message: 'Telemetry setup is live!',
      data: {
        gtmActive: !!settings.googleTagManagerId,
        metaActive: !!settings.metaPixelId,
        googleAdsActive: !!settings.googleAdsConversionId,
        ga4Active: !!settings.ga4MeasurementId,
        advancedMatching: settings.enableAdvancedMatching,
        eventLogActive: settings.enableEventLog,
        lastUpdated: settings.lastUpdated,
        updatedBy: settings.updatedBy
      }
    });
  } catch (error: any) {
    console.error('Tracking Test API Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
