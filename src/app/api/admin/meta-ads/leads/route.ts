import { NextRequest, NextResponse } from 'next/server';
import { getMetaLeads } from '@/lib/meta-sheets-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const sheetName = searchParams.get('sheetName') || undefined;
    const status = (searchParams.get('status') as 'active' | 'inactive' | 'all') || undefined;
    const search = searchParams.get('search') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const data = await getMetaLeads({
      sheetName,
      status,
      search,
      platform,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('Fetch Meta Leads Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Meta Leads',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
