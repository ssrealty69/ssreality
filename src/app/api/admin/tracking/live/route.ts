import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLocationLog from '@/models/AgentLocationLog';
import AgentAttendance from '@/models/AgentAttendance';
import Agent from '@/models/Agent';
import { getGeofenceSettings } from '@/lib/geofenceConfig';

export const dynamic = 'force-dynamic';

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

function formatMinutes(mins?: number): string {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const todayStr = getISTDateString();
    const inShift = isWithinShiftHours();
    const geofence = await getGeofenceSettings();
    const geofenceRadius = geofence.geofenceRadiusMeters || 200;

    // 1. Fetch all active agents (including Yogesh Tanwar / Directors for full GPS radar visibility)
    const allAgents = await Agent.find({
      isActive: true,
    })
      .select('name username phone employee_id allowRemotePunchIn role isExecutive')
      .lean();

    // 2. Aggregate latest location ping for each agent today
    const latestPings = await AgentLocationLog.aggregate([
      { $match: { date: todayStr } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$agentId',
          agentId: { $first: '$agentId' },
          agentName: { $first: '$agentName' },
          latitude: { $first: '$latitude' },
          longitude: { $first: '$longitude' },
          status: { $first: '$status' },
          speed: { $first: '$speed' },
          batteryLevel: { $first: '$batteryLevel' },
          distanceFromOfficeMeters: { $first: '$distanceFromOfficeMeters' },
          address: { $first: '$address' },
          lastPing: { $first: '$timestamp' },
          pingCount: { $sum: 1 },
        },
      },
    ]);

    const pingMap = new Map<string, any>();
    latestPings.forEach((p) => {
      pingMap.set(p.agentId, p);
      pingMap.set(p._id.toString(), p);
    });

    // 3. Fetch today's attendance for all agents
    const attendances = await AgentAttendance.find({ date: todayStr }).lean();
    const attendanceMap = new Map<string, any>();
    attendances.forEach((att) => {
      attendanceMap.set(att.agentId, att);
    });

    const nowMs = Date.now();
    const OFFLINE_THRESHOLD_MS = 15 * 60 * 1000; // 15 mins

    // 4. Build comprehensive live radar agent records
    const formattedAgents = allAgents.map((ag: any) => {
      const agentIdStr = ag._id.toString();
      const empId = ag.employee_id || '';
      const ping = pingMap.get(agentIdStr) || pingMap.get(empId) || null;
      const att = attendanceMap.get(agentIdStr) || attendanceMap.get(empId) || null;

      const hasPing = Boolean(ping && ping.latitude && ping.longitude);
      const meters = hasPing ? (ping.distanceFromOfficeMeters || 0) : 0;
      const km = Number((meters / 1000).toFixed(2));
      const isInsideOffice = meters <= geofenceRadius;

      // Status resolution (10:00 AM - 07:00 PM shift priority):
      let liveStatus: 'IN_OFFICE' | 'ON_FIELD_VISIT' | 'OFF_DUTY' = 'OFF_DUTY';
      if (!inShift) {
        liveStatus = 'OFF_DUTY';
      } else if (hasPing) {
        liveStatus = isInsideOffice ? 'IN_OFFICE' : 'ON_FIELD_VISIT';
      } else {
        // No pings yet during shift hours
        liveStatus = 'OFF_DUTY';
      }

      // Punch In / Out tag
      let punchStatusText = 'Not Punched In';
      let isPunchedIn = false;

      if (att?.punchIn && !att?.punchOut) {
        isPunchedIn = true;
        const pInTime = new Date(att.punchIn).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });
        punchStatusText = `Punched In (${pInTime})`;
      } else if (att?.punchIn && att?.punchOut) {
        const pOutTime = new Date(att.punchOut).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });
        punchStatusText = `Punched Out (${pOutTime})`;
      } else if (!isInsideOffice && inShift && hasPing) {
        punchStatusText = `Outside Office (${km} km)`;
      }

      const lastPingDate = ping?.lastPing ? new Date(ping.lastPing) : null;
      const isSignalFresh = lastPingDate ? (nowMs - lastPingDate.getTime() < OFFLINE_THRESHOLD_MS) : false;

      const distanceFormatted = isInsideOffice
        ? `Inside Office (${meters}m)`
        : `${km} km away from Office`;

      return {
        agentId: agentIdStr,
        agentName: ag.name,
        employee_id: ag.employee_id || ag.username || '—',
        latitude: hasPing ? ping.latitude : (geofence.officeLat || 28.4624272),
        longitude: hasPing ? ping.longitude : (geofence.officeLng || 77.1515298),
        status: liveStatus,
        speed: ping?.speed || 0,
        batteryLevel: ping?.batteryLevel || 100,
        distanceFromOfficeMeters: meters,
        distanceKm: km,
        distanceFormatted,
        address: ping?.address || (isInsideOffice ? 'Jonapur Head Office, New Delhi' : 'Location updating...'),
        lastPing: ping?.lastPing ? ping.lastPing : (att?.lastActiveAt || new Date().toISOString()),
        pingCount: ping?.pingCount || 0,
        hasPing,
        isSignalFresh,
        isPunchedIn,
        punchIn: att?.punchIn ? new Date(att.punchIn).toISOString() : null,
        punchOut: att?.punchOut ? new Date(att.punchOut).toISOString() : null,
        punchStatusText,
        screenTimeFormatted: formatMinutes(Math.round((att?.activeSeconds || 0) / 60)),
      };
    });

    // Sort: Agents on field / in office first, then by distance
    formattedAgents.sort((a, b) => {
      if (a.hasPing && !b.hasPing) return -1;
      if (!a.hasPing && b.hasPing) return 1;
      return b.distanceFromOfficeMeters - a.distanceFromOfficeMeters;
    });

    return NextResponse.json({
      success: true,
      date: todayStr,
      isShiftActive: inShift,
      shiftWindow: '10:00 AM – 07:00 PM IST',
      office: {
        name: 'SS REALTY HEAD OFFICE',
        address: geofence.officeAddress || 'Dalmia farm, Plot no-2, Jona Pur, Jaunapur, New Delhi, Delhi 110047',
        latitude: geofence.officeLat || 28.4624272,
        longitude: geofence.officeLng || 77.1515298,
        radiusMeters: geofenceRadius,
      },
      agents: formattedAgents,
    });
  } catch (error: any) {
    console.error('Error fetching live agent tracking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
