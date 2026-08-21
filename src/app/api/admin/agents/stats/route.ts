import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';
import AgentAttendance from '@/models/AgentAttendance';
import { localToday } from '@/lib/dateUtils';

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
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Agent ID required' }, { status: 400 });
    }

    await connectDB();

    // Today's date range
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const todayStr = localToday();

    const allLeads = await AgentLead.find({ agentId }).lean();

    const totalAssigned = allLeads.length;
    const interested = allLeads.filter((l: any) => l.disposition === 'interested').length;
    const followUps = allLeads.filter((l: any) => l.disposition === 'follow_up').length;
    const visitsDone = allLeads.filter((l: any) => l.disposition === 'visit_done').length;

    const callsMadeToday = allLeads.filter((lead: any) =>
      lead.history?.some((h: any) => {
        const d = new Date(h.calledAt);
        return d >= startOfDay && d <= endOfDay;
      })
    ).length;

    const recentLeads = [...allLeads].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);

    // Fetch Today's Attendance & Screen Time
    const todayAttendance = await AgentAttendance.findOne({ agentId, date: todayStr }).lean();
    const nowMs = Date.now();
    const lastActive = todayAttendance?.lastActiveAt ? new Date(todayAttendance.lastActiveAt) : null;
    const isOnline = lastActive ? (nowMs - lastActive.getTime() < 3 * 60 * 1000) : false;
    const todayActiveSeconds = todayAttendance?.activeSeconds || 0;

    // Fetch last 7 days active usage
    const past7Days = await AgentAttendance.find({ agentId })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    const weeklyUsage = past7Days.map((att: any) => ({
      date: att.date,
      activeSeconds: att.activeSeconds || 0,
      activeFormatted: formatDuration(att.activeSeconds || 0),
      totalMinutes: att.totalMinutes || 0,
    })).reverse();

    return NextResponse.json({
      success: true,
      stats: {
        totalAssigned,
        interested,
        followUps,
        visitsDone,
        callsMadeToday,
        screenTime: {
          todayActiveSeconds,
          todayActiveFormatted: formatDuration(todayActiveSeconds),
          isOnline,
          lastActiveAt: lastActive ? lastActive.toISOString() : null,
          punchIn: todayAttendance?.punchIn ? new Date(todayAttendance.punchIn).toISOString() : null,
          punchOut: todayAttendance?.punchOut ? new Date(todayAttendance.punchOut).toISOString() : null,
          totalMinutes: todayAttendance?.totalMinutes || 0,
          sessionCount: todayAttendance?.sessionCount || 0,
          weeklyUsage,
        }
      },
      recentLeads
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
