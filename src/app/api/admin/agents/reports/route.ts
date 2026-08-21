import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';
import AgentAttendance from '@/models/AgentAttendance';
import AgentLocationLog from '@/models/AgentLocationLog';
import { getLocalDateRange, localToday } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const { start, end } = getLocalDateRange(from, to);
    const todayStr = localToday();

    const agents = await Agent.find({}).select('name username phone employee_id isActive').lean();

    const nowMs = Date.now();
    const ONLINE_THRESHOLD_MS = 3 * 60 * 1000; // 3 mins

    const reports = await Promise.all(
      agents.map(async (agent) => {
        const agentId = (agent._id as any).toString();
        const allLeads = await AgentLead.find({
          $or: [
            { agentId },
            { agentId: (agent as any).employee_id },
            { agentName: new RegExp(`^${agent.name}$`, 'i') },
            { 'history.agentName': new RegExp(`^${agent.name}$`, 'i') },
          ],
        }).lean();
        const totalLeads = allLeads.length;

        let callsInRange = 0;
        let manualDialed = 0;
        allLeads.forEach((lead: any) => {
          if (lead.history) {
            const rangeHistory = lead.history.filter((h: any) => {
              const d = new Date(h.calledAt);
              return d >= start && d <= end;
            });
            callsInRange += rangeHistory.length;
            if (rangeHistory.length > 0) manualDialed += 1;
          }
        });

        const dispositionMap: Record<string, number> = {};
        allLeads.forEach((lead: any) => {
          dispositionMap[lead.disposition] = (dispositionMap[lead.disposition] || 0) + 1;
        });

        // Today's attendance & live online presence
        const todayAtt: any = await AgentAttendance.findOne({ agentId, date: todayStr }).lean();
        const isOnline = Boolean(
          todayAtt?.punchIn &&
          !todayAtt?.punchOut &&
          todayAtt?.lastActiveAt &&
          (nowMs - new Date(todayAtt.lastActiveAt).getTime() < ONLINE_THRESHOLD_MS)
        );
        const lastActive = todayAtt?.lastActiveAt
          ? new Date(todayAtt.lastActiveAt)
          : (todayAtt?.punchIn ? new Date(todayAtt.punchIn) : null);

        // Attendance & Screen Time in range
        const attendanceRecords = await AgentAttendance.find({
          agentId,
          date: { $gte: from || todayStr, $lte: to || todayStr },
        }).lean();

        const totalActiveSecondsInRange = attendanceRecords.reduce(
          (sum: number, att: any) => sum + (att.activeSeconds || 0),
          0
        );

        // Check today's latest location log
        const lastLocation: any = await AgentLocationLog.findOne({ agentId, date: todayStr })
          .sort({ timestamp: -1 })
          .lean();
        const lastDistanceMeters = lastLocation?.distanceFromOfficeMeters;
        const lastDistanceKm = lastDistanceMeters !== undefined ? Number((lastDistanceMeters / 1000).toFixed(2)) : null;
        const lastDistanceFormatted = lastDistanceMeters !== undefined
          ? (lastDistanceMeters < 200 ? `Inside Office (${lastDistanceMeters}m)` : `${lastDistanceKm} km away from Office`)
          : null;

        return {
          agentId,
          name: agent.name,
          username: agent.username,
          employee_id: (agent as any).employee_id,
          isActive: agent.isActive,
          isOnline,
          lastActiveAt: lastActive ? lastActive.toISOString() : null,
          lastDistanceKm,
          lastDistanceFormatted,
          lastLocationAddress: lastLocation?.address || null,
          todayActiveSeconds: todayAtt?.activeSeconds || 0,
          todayActiveFormatted: formatDuration(todayAtt?.activeSeconds || 0),
          totalActiveSecondsInRange,
          activeFormattedInRange: formatDuration(totalActiveSecondsInRange),
          punchIn: todayAtt?.punchIn ? new Date(todayAtt.punchIn).toISOString() : null,
          punchOut: todayAtt?.punchOut ? new Date(todayAtt.punchOut).toISOString() : null,
          sessionCount: todayAtt?.sessionCount || 0,
          totalLeads,
          callsToday: callsInRange,
          manualDialed,
          interested: dispositionMap['interested'] || 0,
          visitScheduled: dispositionMap['follow_up'] || 0,
          visitDone: dispositionMap['visit_done'] || 0,
          followUp: dispositionMap['follow_up'] || 0,
          notInterested: dispositionMap['not_interested'] || 0,
          connected: dispositionMap['connected'] || 0,
          notConnected: (dispositionMap['not_connected'] || 0) + (dispositionMap['switch_off'] || 0) + (dispositionMap['not_reachable'] || 0),
          newLeads: dispositionMap['new'] || 0,
        };
      })
    );

    reports.sort((a, b) => b.callsToday - a.callsToday);
    return NextResponse.json({ success: true, data: reports });
  } catch (err: any) {
    console.error('Agent Report Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
