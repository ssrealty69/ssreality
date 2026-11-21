import { NextRequest, NextResponse } from 'next/server';
import { setAutoDistributionEnabled, getAutoDistributionConfig } from '@/lib/lead-distributor';
import { verifyAgentToken } from '@/lib/agentAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // ✅ SECURITY: Require valid token
    const auth = await verifyAgentToken(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const config = await getAutoDistributionConfig();
    return NextResponse.json({ success: true, ...config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // ✅ SECURITY: Require valid token
    const auth = await verifyAgentToken(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
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
