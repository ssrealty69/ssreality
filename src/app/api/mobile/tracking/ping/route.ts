import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLocationLog from '@/models/AgentLocationLog';
import AgentAttendance from '@/models/AgentAttendance';
import Agent from '@/models/Agent';
import { getGeofenceSettings } from '@/lib/geofenceConfig';

export const dynamic = 'force-dynamic';

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function getISTDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

function isWithinShiftHours(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // 10:00 AM (600 mins) to 07:00 PM (1140 mins)
  return timeInMinutes >= 600 && timeInMinutes <= 1140;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      agentId,
      agentName,
      latitude,
      longitude,
      accuracy,
      speed,
      batteryLevel,
      address,
    } = body;

    if (!agentId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'agentId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const geoConfig = await getGeofenceSettings();
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    const distanceMeters = calculateDistanceMeters(
      geoConfig.officeLat,
      geoConfig.officeLng,
      latNum,
      lngNum
    );
    const todayStr = getISTDateString();
    const inShift = isWithinShiftHours();

    // Check if agent exists and get details
    let agent = null;
    if (agentId.match(/^[0-9a-fA-F]{24}$/)) {
      agent = await Agent.findById(agentId).select('allowRemotePunchIn name employee_id username role isExecutive').lean();
    }
    if (!agent) {
      agent = await Agent.findOne({
        $or: [
          { employee_id: agentId },
          { employee_id: agentId.toUpperCase() },
          { username: agentId.toLowerCase() }
        ]
      }).select('allowRemotePunchIn name employee_id username role isExecutive').lean();
    }

    const isWithinRadius = distanceMeters <= (geoConfig.geofenceRadiusMeters || 200);

    // Calculate real status:
    // Between 10:00 AM and 07:00 PM:
    // - If <= 200m from office: IN_OFFICE
    // - If > 200m from office: ON_FIELD_VISIT (even if punched out or not punched in)
    // Outside 10:00 AM - 07:00 PM: OFF_DUTY
    let calculatedStatus: 'IN_OFFICE' | 'ON_FIELD_VISIT' | 'OFF_DUTY';
    if (!inShift) {
      calculatedStatus = 'OFF_DUTY';
    } else if (isWithinRadius) {
      calculatedStatus = 'IN_OFFICE';
    } else {
      calculatedStatus = 'ON_FIELD_VISIT';
    }

    const isExecutive = 
      (agent as any)?.role === 'director' || 
      (agent as any)?.isExecutive === true ||
      (agent as any)?.employee_id === 'SSR000' || 
      /yogesh/i.test((agent as any)?.name || '') || 
      (agent as any)?.username === 'info@ssrealty.org';

    const effectiveAgentName = agentName || agent?.name || 'Agent';
    const effectiveAgentId = agent ? (agent as any)._id.toString() : String(agentId);

    // 1. Record location breadcrumb in AgentLocationLog (Exempt Director / Executive)
    let log = null;
    if (!isExecutive) {
      log = await AgentLocationLog.create({
        agentId: effectiveAgentId,
        agentName: effectiveAgentName,
        latitude: latNum,
        longitude: lngNum,
        accuracy: accuracy ? Number(accuracy) : undefined,
        speed: speed ? Number(speed) : undefined,
        batteryLevel: batteryLevel ? Number(batteryLevel) : undefined,
        status: calculatedStatus,
        distanceFromOfficeMeters: distanceMeters,
        address: address || undefined,
        timestamp: new Date(),
        date: todayStr,
      });
    }

    // 2. Track screen/app activity heartbeat WITHOUT altering punchIn or punchOut
    const now = new Date();
    const additionalActiveSeconds = body.activeSeconds ? Number(body.activeSeconds) : 0;
    let attendance = await AgentAttendance.findOne({ agentId: effectiveAgentId, date: todayStr });

    if (attendance) {
      attendance.lastActiveAt = now;
      if (additionalActiveSeconds > 0) {
        attendance.activeSeconds = (attendance.activeSeconds || 0) + additionalActiveSeconds;
      }
      await attendance.save();
    } else {
      // Create lightweight session record without fake punchIn
      await AgentAttendance.create({
        agentId: effectiveAgentId,
        agentName: effectiveAgentName,
        date: todayStr,
        activeSeconds: additionalActiveSeconds,
        lastActiveAt: now,
        sessionCount: 1,
      });
    }

    const distanceKm = Number((distanceMeters / 1000).toFixed(2));
    const distanceFormatted = isWithinRadius
      ? `Inside Office (${distanceMeters}m)`
      : `${distanceKm} km away from Office`;

    return NextResponse.json({
      success: true,
      status: calculatedStatus,
      distanceFromOfficeMeters: distanceMeters,
      distanceFromOfficeKm: distanceKm,
      distanceFormatted,
      isOfficeGeofence: isWithinRadius,
      isShiftActive: inShift,
      shiftWindow: '10:00 AM - 07:00 PM IST',
      logId: log._id,
    });
  } catch (error: any) {
    console.error('Error in location tracking ping:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
