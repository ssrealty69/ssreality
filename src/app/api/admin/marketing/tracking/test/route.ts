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

    const dbSettings = await getTrackingSettings();
    
    if (!dbSettings) {
      return NextResponse.json({ success: false, error: 'Tracking configurations not found' }, { status: 404 });
    }

    let settings = JSON.parse(JSON.stringify(dbSettings));

    // Support testing unsaved in-progress changes from form body
    try {
      const body = await req.json();
      if (body && typeof body === 'object') {
        settings = {
          ...settings,
          ...body
        };
      }
    } catch (e) {
      // Fallback to database settings if no body is supplied
    }

    if (!settings.isEnabled) {
      return NextResponse.json({
        success: false,
        message: 'Global tracking is disabled. Toggle "GLOBAL RETARGETING" to ON and click "Save Telemetry Setup" to activate it.'
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
