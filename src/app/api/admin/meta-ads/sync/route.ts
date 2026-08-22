import { NextRequest, NextResponse } from 'next/server';
import { fetchAndSyncGoogleSheets, DEFAULT_META_SHEET_ID } from '@/lib/meta-sheets-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s for full sync

export async function POST(req: NextRequest) {
  try {
    let sheetId = DEFAULT_META_SHEET_ID;
    try {
      const body = await req.json();
      if (body?.sheetId) sheetId = body.sheetId;
    } catch {
      // Empty body is okay, use default sheetId
    }

    const result = await fetchAndSyncGoogleSheets(sheetId);

    return NextResponse.json({
      success: true,
      message: `Meta Leads Sync Complete: ${result.totalSheets} sheets processed, ${result.totalNewInserted} new leads saved, ${result.totalUpdated} updated.`,
      data: result,
    });
  } catch (error: any) {
    console.error('Meta Sheets Sync Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync Meta Google Sheets',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
