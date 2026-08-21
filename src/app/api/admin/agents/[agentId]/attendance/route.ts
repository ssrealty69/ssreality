import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentAttendance from '@/models/AgentAttendance';
import { getLocalDateRange, localToday, parseLocalDate } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { agentId } = params;
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Default: last 30 days
    const todayStr = localToday();
    const fromStr = from || (() => {
      const d = new Date(); d.setDate(d.getDate() - 30); return toLocalDateStr(d);
    })();
    const toStr = to || todayStr;

    const startDate = parseLocalDate(fromStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = parseLocalDate(toStr);
    endDate.setHours(23, 59, 59, 999);

    const records = await AgentAttendance.find({
      agentId,
      date: { $gte: fromStr, $lte: toStr },
    }).sort({ date: -1 }).lean();

    const formatDuration = (totalSeconds: number): string => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    // Build all days in range — using local date iteration
    const allDays: {
      date: string;
      punchIn?: string;
      punchOut?: string;
      totalMinutes?: number;
      activeSeconds?: number;
      activeFormatted?: string;
      lastActiveAt?: string;
      sessionCount?: number;
      status: 'present' | 'absent' | 'off';
    }[] = [];

    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dateStr = toLocalDateStr(cur); // LOCAL date string
      const dayOfWeek = cur.getDay(); // 0=Sun
      const record = records.find((r) => r.date === dateStr);

      if (record) {
        const punchIn = new Date(record.punchIn);
        const punchOut = record.punchOut ? new Date(record.punchOut) : null;
        const totalMinutes = punchOut
          ? Math.round((punchOut.getTime() - punchIn.getTime()) / 60000)
          : undefined;

        allDays.push({
          date: dateStr,
          punchIn: punchIn.toISOString(),
          punchOut: punchOut?.toISOString(),
          totalMinutes,
          activeSeconds: record.activeSeconds || 0,
          activeFormatted: formatDuration(record.activeSeconds || 0),
          lastActiveAt: record.lastActiveAt ? new Date(record.lastActiveAt).toISOString() : undefined,
          sessionCount: record.sessionCount || 0,
          status: 'present',
        });
      } else if (dayOfWeek === 0) {
        allDays.push({ date: dateStr, status: 'off', activeSeconds: 0, activeFormatted: '0m' });
      } else {
        allDays.push({ date: dateStr, status: 'absent', activeSeconds: 0, activeFormatted: '0m' });
      }

      cur.setDate(cur.getDate() + 1);
    }

    return NextResponse.json({ success: true, attendance: allDays.reverse() });
  } catch (err: any) {
    console.error('Attendance GET Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { agentId } = params;
    const todayStr = toLocalDateStr(new Date()); // LOCAL date

    const record = await AgentAttendance.findOne({ agentId, date: todayStr });
    if (!record) {
      return NextResponse.json({ success: false, error: 'No punch-in found for today' }, { status: 404 });
    }

    const punchOut = new Date();
    const totalMinutes = Math.round((punchOut.getTime() - new Date(record.punchIn).getTime()) / 60000);
    record.punchOut = punchOut;
    record.totalMinutes = totalMinutes;
    await record.save();

    return NextResponse.json({ success: true, message: 'Punch-out recorded' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
