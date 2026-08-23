import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentSession from '@/models/AgentSession';
import AgentAttendance from '@/models/AgentAttendance';
import { getGeofenceSettings } from '@/lib/geofenceConfig';

export const dynamic = 'force-dynamic';

function getISTDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    let agentId = searchParams.get('agentId');
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
        { success: false, error: 'agentId parameter or Bearer token is required' },
        { status: 400 }
      );
    }

    let agent = null;
    if (agentId.match(/^[0-9a-fA-F]{24}$/)) {
      agent = await Agent.findById(agentId).select('name username employee_id allowRemotePunchIn isActive').lean();
    }
    if (!agent) {
      agent = await Agent.findOne({
        $or: [
          { employee_id: agentId },
          { employee_id: agentId.toUpperCase() },
          { username: agentId.toLowerCase() }
        ]
      }).select('name username employee_id allowRemotePunchIn isActive').lean();
    }

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const isExecutive = 
      (agent as any).role === 'director' || 
      (agent as any).isExecutive === true ||
      (agent as any).employee_id === 'SSR000' || 
      /yogesh/i.test((agent as any).name) || 
      (agent as any).username === 'info@ssrealty.org';

    const geoConfig = await getGeofenceSettings();
    const isAgentRemoteExempted = Boolean((agent as any).allowRemotePunchIn) || isExecutive;
    const isGeofenceRequired = !isExecutive && geoConfig.geofenceEnabled && !isAgentRemoteExempted;

    const todayStr = getISTDateString();
    const attendance = await AgentAttendance.findOne({ agentId: String(agent._id), date: todayStr }).lean();

    const isPunchedIn = isExecutive ? true : Boolean(attendance && attendance.punchIn && !attendance.punchOut);
    const isShiftCompleted = isExecutive ? false : Boolean(attendance && attendance.punchIn && attendance.punchOut && attendance.totalMinutes);

    return NextResponse.json({
      success: true,
      todayDate: todayStr,
      isExecutive,
      isExempt: isExecutive,
      isPunchedIn,
      isShiftCompleted,
      attendance: attendance || null,
      geofencePolicy: {
        isGeofenceRequired,
        geofenceEnabled: geoConfig.geofenceEnabled,
        isAgentRemoteExempted,
        officeName: 'SS REALTY',
        officeAddress: geoConfig.officeAddress,
        officeLat: geoConfig.officeLat,
        officeLng: geoConfig.officeLng,
        geofenceRadiusMeters: geoConfig.geofenceRadiusMeters,
      },
    });

  } catch (error: any) {
    console.error('Attendance Status API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
