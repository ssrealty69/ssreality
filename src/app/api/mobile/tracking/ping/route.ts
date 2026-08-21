import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLocationLog from '@/models/AgentLocationLog';
import AgentAttendance from '@/models/AgentAttendance';
import Agent from '@/models/Agent';
import { getGeofenceSettings } from '@/lib/geofenceConfig';

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

    // Check if agent has remote punch-in exemption
    let isAgentRemoteAllowed = false;
    const agent = await Agent.findById(agentId).select('allowRemotePunchIn name').lean();
    if (agent && (agent as any).allowRemotePunchIn) {
      isAgentRemoteAllowed = true;
    }

    const isGeofenceEnforced = geoConfig.geofenceEnabled && !isAgentRemoteAllowed;
    const isWithinRadius = distanceMeters <= geoConfig.geofenceRadiusMeters;

    let calculatedStatus: 'IN_OFFICE' | 'ON_FIELD_VISIT' | 'OFF_DUTY';
    if (!inShift) {
      calculatedStatus = 'OFF_DUTY';
    } else if (isWithinRadius) {
      calculatedStatus = 'IN_OFFICE';
    } else {
      calculatedStatus = 'ON_FIELD_VISIT';
    }

    // 1. Record location log
    const log = await AgentLocationLog.create({
      agentId: String(agentId),
      agentName: agentName || agent?.name || 'Agent',
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

    // 2. Auto-manage attendance & active time for today
    const now = new Date();
    let attendance = await AgentAttendance.findOne({ agentId: String(agentId), date: todayStr });
    const additionalActiveSeconds = body.activeSeconds ? Number(body.activeSeconds) : 0;

    if (!attendance) {
      attendance = await AgentAttendance.create({
        agentId: String(agentId),
        agentName: agentName || agent?.name || 'Agent',
        date: todayStr,
        punchIn: now,
        punchOut: now,
        activeSeconds: additionalActiveSeconds,
        lastActiveAt: now,
      });
    } else {
      attendance.lastActiveAt = now;
      attendance.punchOut = now;
      if (additionalActiveSeconds > 0) {
        attendance.activeSeconds = (attendance.activeSeconds || 0) + additionalActiveSeconds;
      }
      if (attendance.punchIn) {
        attendance.totalMinutes = Math.round(
          (now.getTime() - new Date(attendance.punchIn).getTime()) / 60000
        );
      }
      await attendance.save();
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
      isOfficeGeofence: isWithinRadius || !isGeofenceEnforced,
      isGeofenceEnforced,
      isRemoteAllowed: !isGeofenceEnforced,
      isShiftActive: inShift,
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
