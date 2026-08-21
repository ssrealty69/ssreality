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

    // 1. Authenticate agent
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

    const { latitude, longitude, accuracy, address, deviceId, deviceModel } = body;
    const todayStr = getISTDateString();
    const now = new Date();

    const attendance = await AgentAttendance.findOne({ agentId: String(agent._id), date: todayStr });
    if (!attendance) {
      return NextResponse.json(
        { success: false, error: 'No punch-in record found for today. Please punch-in first.' },
        { status: 404 }
      );
    }

    const geoConfig = await getGeofenceSettings();
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    const isValidCoords = !isNaN(latNum) && !isNaN(lngNum) && (latNum !== 0 || lngNum !== 0);

    let distanceMeters = 0;
    if (isValidCoords) {
      distanceMeters = calculateDistanceMeters(
        geoConfig.officeLat,
        geoConfig.officeLng,
        latNum,
        lngNum
      );
    }

    // Update punch-out
    attendance.punchOut = now;
    if (attendance.punchIn) {
      attendance.totalMinutes = Math.max(
        1,
        Math.round((now.getTime() - new Date(attendance.punchIn).getTime()) / 60000)
      );
    }
    if (isValidCoords) {
      attendance.punchOutLat = latNum;
      attendance.punchOutLng = lngNum;
      attendance.punchOutDistanceMeters = distanceMeters;
    }
    attendance.punchOutAddress = address || 'SS Realty Office';
    await attendance.save();

    // Log location breadcrumb
    if (isValidCoords) {
      try {
        await AgentLocationLog.create({
          agentId: String(agent._id),
          agentName: agent.name,
          employeeId: agent.employee_id,
          date: todayStr,
          timestamp: now,
          latitude: latNum,
          longitude: lngNum,
          accuracy: accuracy || 0,
          speed: 0,
          heading: 0,
          altitude: 0,
          isMoving: false,
          isMock: false,
          batteryLevel: 100,
          locationStatus: distanceMeters <= geoConfig.geofenceRadiusMeters ? 'in_office' : 'site_visit',
          address: address || 'SS Realty Office',
          notes: 'Punch-Out event recorded',
        });
      } catch (_) {}
    }

    const hours = Math.floor((attendance.totalMinutes || 0) / 60);
    const mins = (attendance.totalMinutes || 0) % 60;
    const durationFormatted = `${hours}h ${mins}m`;

    return NextResponse.json({
      success: true,
      message: `Shift completed: ${durationFormatted}`,
      punchOutTime: now.toISOString(),
      totalMinutes: attendance.totalMinutes || 0,
      totalShiftFormatted: durationFormatted,
      activeSeconds: attendance.activeSeconds || 0,
      attendance: {
        id: attendance._id,
        date: attendance.date,
        punchIn: attendance.punchIn,
        punchOut: attendance.punchOut,
        totalMinutes: attendance.totalMinutes,
      },
    });

  } catch (error: any) {
    console.error('Punch-Out API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
