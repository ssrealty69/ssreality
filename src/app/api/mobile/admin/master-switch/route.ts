import { NextRequest, NextResponse } from 'next/server';
import { setAutoDistributionEnabled, getAutoDistributionConfig } from '@/lib/lead-distributor';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getAutoDistributionConfig();
    return NextResponse.json({ success: true, ...config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const enabled = Boolean(body.enabled);
    const updated = await setAutoDistributionEnabled(enabled);
    const config = await getAutoDistributionConfig();

    return NextResponse.json({
      success: true,
      message: `Master Lead Auto-Distribution is now ${enabled ? 'ACTIVATED (ON)' : 'PAUSED (OFF)'}`,
      ...config,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
