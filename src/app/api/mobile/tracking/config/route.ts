import { NextRequest, NextResponse } from 'next/server';
import { getGeofenceSettings } from '@/lib/geofenceConfig';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    const settings = await getGeofenceSettings();
    let isAgentExempted = false;

    if (agentId) {
      await connectDB();
      const agent = await Agent.findById(agentId).select('allowRemotePunchIn name').lean();
      if (agent && (agent as any).allowRemotePunchIn) {
        isAgentExempted = true;
      }
    }

    // Geofence lock is required for Punch-In ONLY IF global setting is ON AND agent is not individually exempted
    const isGeofenceRequired = settings.geofenceEnabled && !isAgentExempted;

    return NextResponse.json({
      success: true,
      // Punch-in geofence lock policy
      isGeofenceRequired,
      isRemoteAllowed: !isGeofenceRequired,
      geofenceEnabled: settings.geofenceEnabled,
      isAgentExempted,
      
      // 🚨 MANDATORY FIELD TRACKING POLICY (10:00 AM - 07:00 PM IST)
      // Continuous background radar tracking is ALWAYS ENFORCED for all logged-in agents,
      // regardless of whether they have punched in or already punched out.
      isGpsTrackingAlwaysActive: true,
      enforceTrackingWithoutPunchIn: true,
      keepTrackingAfterPunchOut: true,
      trackingPolicy: 'MANDATORY_10AM_TO_7PM',
      shiftHours: {
        start: '10:00',
        end: '19:00',
        timezone: 'Asia/Kolkata',
      },
      pingIntervalSeconds: 30,
      minDistanceFilterMeters: 5,
      officeAddress: settings.officeAddress,
      officeLat: settings.officeLat,
      officeLng: settings.officeLng,
      geofenceRadiusMeters: settings.geofenceRadiusMeters,
      emergencyModeReason: !settings.geofenceEnabled ? settings.emergencyModeReason : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
