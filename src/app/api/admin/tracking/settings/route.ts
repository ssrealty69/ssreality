import { NextRequest, NextResponse } from 'next/server';
import { getGeofenceSettings, saveGeofenceSettings } from '@/lib/geofenceConfig';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getGeofenceSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const roleCookie = req.cookies.get('admin_role')?.value;
  const isSuperAdmin = roleCookie === 'super_admin' || req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET;
  if (!isSuperAdmin) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Administrative permissions required' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const updated = await saveGeofenceSettings({
      geofenceEnabled: typeof body.geofenceEnabled === 'boolean' ? body.geofenceEnabled : undefined,
      officeAddress: body.officeAddress,
      officeLat: body.officeLat ? Number(body.officeLat) : undefined,
      officeLng: body.officeLng ? Number(body.officeLng) : undefined,
      geofenceRadiusMeters: body.geofenceRadiusMeters ? Number(body.geofenceRadiusMeters) : undefined,
      emergencyModeReason: body.emergencyModeReason,
    });

    return NextResponse.json({
      success: true,
      message: updated.geofenceEnabled
        ? 'Strict Office Geofence Mode Enabled (Agents must be at office)'
        : 'Emergency / Remote Mode Enabled (Agents can punch in from anywhere)',
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
