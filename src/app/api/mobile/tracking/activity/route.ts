import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentAttendance from '@/models/AgentAttendance';
import AgentActivityLog from '@/models/AgentActivityLog';
import Agent from '@/models/Agent';
import { localToday } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      agentId,
      agentName,
      activeDurationSeconds,
      activeSeconds,
      screenName,
      deviceInfo,
      isSessionStart,
    } = body;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'agentId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const secondsToAdd = Number(activeDurationSeconds || activeSeconds || 0);
    const todayStr = localToday();
    const now = new Date();

    let agent = null;
    if (typeof agentId === 'string' && agentId.match(/^[0-9a-fA-F]{24}$/)) {
      agent = await Agent.findById(agentId).select('name employee_id username').lean();
    }
    if (!agent && typeof agentId === 'string') {
      agent = await Agent.findOne({
        $or: [
          { employee_id: agentId },
          { employee_id: agentId.toUpperCase() },
          { username: agentId.toLowerCase() }
        ]
      }).select('name employee_id username').lean();
    }

    const effectiveAgentId = agent ? (agent as any)._id.toString() : String(agentId);
    let resolvedName = agentName || agent?.name || 'Agent';

    // 1. Find or create today's attendance & screen time
    let attendance = await AgentAttendance.findOne({
      $or: [
        { agentId: effectiveAgentId },
        { agentId: agentId },
        { agentId: (agent as any)?.employee_id },
        { agentId: (agent as any)?.username }
      ].filter(Boolean),
      date: todayStr,
    });

    if (!attendance) {
      attendance = await AgentAttendance.create({
        agentId: effectiveAgentId,
        agentName: resolvedName,
        date: todayStr,
        activeSeconds: secondsToAdd,
        lastActiveAt: now,
        sessionCount: 1,
        deviceInfo: deviceInfo || '',
      });
    } else {
      attendance.activeSeconds = (attendance.activeSeconds || 0) + secondsToAdd;
      attendance.lastActiveAt = now;
      if (isSessionStart) {
        attendance.sessionCount = (attendance.sessionCount || 1) + 1;
      }
      if (deviceInfo) {
        attendance.deviceInfo = deviceInfo;
      }
      await attendance.save();
    }

    // 2. Record detailed log if active time was spent
    if (secondsToAdd > 0) {
      await AgentActivityLog.create({
        agentId: String(agentId),
        agentName: resolvedName,
        date: todayStr,
        activeSeconds: secondsToAdd,
        screenName: screenName || '',
        deviceInfo: deviceInfo || '',
        timestamp: now,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        agentId: String(agentId),
        date: todayStr,
        todayActiveSeconds: attendance.activeSeconds,
        todayActiveFormatted: formatDuration(attendance.activeSeconds),
        isOnline: true,
        lastActiveAt: attendance.lastActiveAt,
        punchIn: attendance.punchIn,
        punchOut: attendance.punchOut,
      },
    });
  } catch (error: any) {
    console.error('Error in agent screen activity tracking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
