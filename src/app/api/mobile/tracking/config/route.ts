import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
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
    let isExecutive = false;

    if (agentId) {
      await connectDB();
      let agent: any = null;
      if (mongoose.Types.ObjectId.isValid(agentId)) {
        agent = await Agent.findById(agentId).select('allowRemotePunchIn name employee_id username role isExecutive').lean();
      }
      if (!agent) {
        agent = await Agent.findOne({
          $or: [
            { employee_id: agentId },
            { employee_id: agentId.toUpperCase() },
            { username: agentId.toLowerCase() },
            { name: new RegExp(`^${agentId}$`, 'i') },
          ]
        }).select('allowRemotePunchIn name employee_id username role isExecutive').lean();
      }

      if (agent) {
        isExecutive = 
          agent.role === 'director' || 
          agent.isExecutive === true ||
          agent.employee_id === 'SSR000' || 
          /yogesh/i.test(agent.name || '') || 
          agent.username === 'info@ssrealty.org';

        if (agent.allowRemotePunchIn || isExecutive) {
          isAgentExempted = true;
        }
      }
    }

    // Geofence lock is required for Punch-In ONLY IF global setting is ON AND agent is not individually exempted
    const isGeofenceRequired = !isExecutive && settings.geofenceEnabled && !isAgentExempted;

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
