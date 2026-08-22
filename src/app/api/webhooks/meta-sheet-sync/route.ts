import { NextRequest, NextResponse } from 'next/server';
import { fetchAndSyncGoogleSheets } from '@/lib/meta-sheets-service';

export const dynamic = 'force-dynamic';

/**
 * Instant Webhook for Google Sheets Apps Script, Zapier, Make, and Meta Ads Webhooks
 * Triggered automatically on row changes or scheduled triggers.
 */
export async function POST(req: NextRequest) {
  try {
    const result = await fetchAndSyncGoogleSheets();
    return NextResponse.json({
      success: true,
      message: 'Google Sheets synced and leads distributed successfully in real-time!',
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error('Webhook Meta Sheet Sync Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const result = await fetchAndSyncGoogleSheets();
    return NextResponse.json({
      success: true,
      message: 'Google Sheets synced and leads distributed successfully in real-time!',
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error('Webhook Meta Sheet Sync Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
