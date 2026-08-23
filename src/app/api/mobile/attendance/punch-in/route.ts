import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentSession from '@/models/AgentSession';
import AgentAttendance from '@/models/AgentAttendance';
import AgentLocationLog from '@/models/AgentLocationLog';
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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // 1. Authenticate agent via Bearer token or agentId in body
    let agentId = body.agentId;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = await AgentSession.findOne({ token }).lean();
      if (session && session.agentId) {
        agentId = session.agentId;
      }
    }

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'agentId or Bearer token is required' },
        { status: 401 }
      );
    }

    let agent = null;
    if (agentId.match(/^[0-9a-fA-F]{24}$/)) {
      agent = await Agent.findById(agentId);
    }
    if (!agent) {
      agent = await Agent.findOne({
        $or: [
          { employee_id: agentId },
          { employee_id: agentId.toUpperCase() },
          { username: agentId.toLowerCase() }
        ]
      });
    }

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found in database' },
        { status: 404 }
      );
    }

    if (!agent.isActive) {
      return NextResponse.json(
        { success: false, error: 'Your account is deactivated. Please contact your administrator.' },
        { status: 403 }
      );
    }

    const {
      latitude,
      longitude,
      accuracy,
      address,
      deviceId,
      deviceModel,
      deviceInfo,
      isMockLocation = false,
    } = body;

    const isExecutive = 
      agent.role === 'director' || 
      agent.isExecutive === true ||
      agent.employee_id === 'SSR000' || 
      /yogesh/i.test(agent.name) || 
      agent.username === 'info@ssrealty.org';

    const geoConfig = await getGeofenceSettings();
    const isAgentRemoteExempted = Boolean(agent.allowRemotePunchIn) || isExecutive;
    const isGeofenceRequired = !isExecutive && geoConfig.geofenceEnabled && !isAgentRemoteExempted;

    // 2. Device & GPS Check: Verify if GPS hardware/coordinates are found
    const hasLat = latitude !== undefined && latitude !== null && latitude !== '';
    const hasLng = longitude !== undefined && longitude !== null && longitude !== '';
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    const isValidCoords = hasLat && hasLng && !isNaN(latNum) && !isNaN(lngNum) && (latNum !== 0 || lngNum !== 0);

    if (!isValidCoords && !isExecutive) {
      // Device GPS is NOT found or disabled
      if (isGeofenceRequired) {
        return NextResponse.json(
          {
            success: false,
            deviceFound: false,
            error: 'Device location / GPS not found. Please turn ON your device GPS and grant location permission to proceed.',
            isGeofenceRequired: true,
            officeAddress: geoConfig.officeAddress,
          },
          { status: 400 }
        );
      }
    }

    // 3. Distance & Geofence Enforcement Calculation
    let distanceMeters = 0;
    let isWithinRadius = true;

    if (isValidCoords) {
      distanceMeters = calculateDistanceMeters(
        geoConfig.officeLat,
        geoConfig.officeLng,
        latNum,
        lngNum
      );
      isWithinRadius = distanceMeters <= geoConfig.geofenceRadiusMeters;
    }

    const distanceKm = Number((distanceMeters / 1000).toFixed(2));

    // If geofence is strictly required and agent is outside allowed radius -> BLOCK PUNCH-IN
    if (isGeofenceRequired && !isWithinRadius) {
      return NextResponse.json(
        {
          success: false,
          deviceFound: true,
          error: `Punch-in allowed only at SS Realty Office (within ${geoConfig.geofenceRadiusMeters}m radius). You are currently ${distanceKm} km away.`,
          distanceFromOfficeMeters: distanceMeters,
          distanceFromOfficeKm: distanceKm,
          officeAddress: geoConfig.officeAddress,
          officeLat: geoConfig.officeLat,
          officeLng: geoConfig.officeLng,
          currentLatitude: latNum,
          currentLongitude: lngNum,
          isOfficeGeofence: false,
          isGeofenceEnforced: true,
        },
        { status: 403 }
      );
    }

    // 4. Record Punch-In Attendance in Database
    const todayStr = getISTDateString();
    const now = new Date();

    let attendance = await AgentAttendance.findOne({
      $or: [
        { agentId: String(agent._id) },
        { agentId: agent.employee_id },
        { agentId: agent.username },
      ].filter(Boolean),
      date: todayStr,
    });

    const punchInStatus: 'IN_OFFICE' | 'REMOTE' = isWithinRadius ? 'IN_OFFICE' : 'REMOTE';

    if (!attendance) {
      attendance = await AgentAttendance.create({
        agentId: String(agent._id),
        agentName: agent.name,
        date: todayStr,
        punchIn: now,
        activeSeconds: 0,
        lastActiveAt: now,
        sessionCount: 1,
        deviceInfo: deviceInfo || (deviceModel ? `${deviceModel} (${deviceId || 'ID'})` : 'Mobile Device'),
        deviceId: deviceId ? String(deviceId) : undefined,
        deviceModel: deviceModel ? String(deviceModel) : undefined,
        deviceFound: isValidCoords,
        isMockLocation: Boolean(isMockLocation),
        punchInLat: isValidCoords ? latNum : undefined,
        punchInLng: isValidCoords ? lngNum : undefined,
        punchInAddress: address ? String(address) : undefined,
        punchInDistanceMeters: isValidCoords ? distanceMeters : 0,
        punchInStatus: punchInStatus,
      });
    } else {
      // If resuming or re-punching in today: ALWAYS keep the FIRST punchIn of the day!
      if (!attendance.punchIn) {
        attendance.punchIn = now;
      }
      attendance.punchOut = undefined;
      attendance.totalMinutes = undefined;
      attendance.lastActiveAt = now;
      attendance.sessionCount = (attendance.sessionCount || 1) + 1;
      attendance.deviceFound = isValidCoords;
      if (deviceId) attendance.deviceId = String(deviceId);
      if (deviceModel) attendance.deviceModel = String(deviceModel);
      if (isValidCoords) {
        attendance.punchInLat = latNum;
        attendance.punchInLng = lngNum;
        attendance.punchInDistanceMeters = distanceMeters;
        attendance.punchInStatus = punchInStatus;
      }
      await attendance.save();
    }

    // 5. Log Initial Location Ping if coordinates are valid
    if (isValidCoords) {
      await AgentLocationLog.create({
        agentId: String(agent._id),
        agentName: agent.name,
        latitude: latNum,
        longitude: lngNum,
        accuracy: accuracy ? Number(accuracy) : undefined,
        status: isWithinRadius ? 'IN_OFFICE' : 'ON_FIELD_VISIT',
        distanceFromOfficeMeters: distanceMeters,
        address: address || undefined,
        timestamp: now,
        date: todayStr,
      });
    }

    return NextResponse.json({
      success: true,
      message: isWithinRadius
        ? `Punch-In Successful! Welcome to SS Realty Office (${distanceMeters}m from base).`
        : `Punch-In Successful (Remote / Emergency Mode Active - ${distanceKm} KM from office).`,
      punchInTime: now.toISOString(),
      agent: {
        id: agent._id.toString(),
        name: agent.name,
        employee_id: agent.employee_id,
        username: agent.username,
      },
      device: {
        deviceFound: isValidCoords,
        deviceId: deviceId || null,
        deviceModel: deviceModel || null,
        isMockLocation: Boolean(isMockLocation),
      },
      location: {
        latitude: isValidCoords ? latNum : null,
        longitude: isValidCoords ? lngNum : null,
        distanceFromOfficeMeters: distanceMeters,
        distanceFromOfficeKm: distanceKm,
        isInsideOffice: isWithinRadius,
        officeAddress: geoConfig.officeAddress,
        officeRadiusMeters: geoConfig.geofenceRadiusMeters,
      },
      attendance: {
        id: attendance._id,
        date: attendance.date,
        punchIn: attendance.punchIn,
        punchInStatus: attendance.punchInStatus,
      },
    });

  } catch (error: any) {
    console.error('Punch-In API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
