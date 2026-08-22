import { NextRequest, NextResponse } from 'next/server';
import { generateMetaExportWorkbook } from '@/lib/meta-sheets-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get('mode') as 'all' | 'active' | 'inactive' | 'single') || 'all';
    const sheet = searchParams.get('sheet') || undefined;

    const buffer = await generateMetaExportWorkbook(mode, sheet);

    const nowStr = new Date().toISOString().slice(0, 10);
    let fileName = `SS_Realty_Meta_Leads_Master_${nowStr}.xlsx`;

    if (mode === 'active') {
      fileName = `SS_Realty_Meta_Active_Campaigns_${nowStr}.xlsx`;
    } else if (mode === 'inactive') {
      fileName = `SS_Realty_Meta_Inactive_Campaigns_${nowStr}.xlsx`;
    } else if (mode === 'single' && sheet) {
      const cleanSheet = sheet.replace(/[^a-zA-Z0-9_-]/g, '_');
      fileName = `SS_Realty_Meta_${cleanSheet}_${nowStr}.xlsx`;
    }

    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': uint8Array.byteLength.toString(),
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Meta Export Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate Meta Leads export',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
