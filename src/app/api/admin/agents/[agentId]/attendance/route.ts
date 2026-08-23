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
  props: { params: Promise<{ agentId: string }> | { agentId: string } }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(props.params);
    const agentId = String(resolvedParams?.agentId || '');
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 });
    }

    // Find agent for robust multi-field lookup
    let agent = null;
    if (agentId.match(/^[0-9a-fA-F]{24}$/)) {
      agent = await Agent.findById(agentId).lean();
    }
    if (!agent) {
      agent = await Agent.findOne({
        $or: [
          { employee_id: agentId },
          { employee_id: agentId.toUpperCase() },
          { username: agentId.toLowerCase() }
        ]
      }).lean();
    }

    const agentObjId = agent ? (agent as any)._id.toString() : agentId;
    const empId = agent ? (agent as any).employee_id : '';
    const un = agent ? (agent as any).username : '';
    const agName = agent ? (agent as any).name : '';

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

    const agentMatch = {
      $or: [
        { agentId: agentObjId },
        { agentId: empId },
        { agentId: un },
        { agentId: agentId },
        { agentName: new RegExp(`^${agName}$`, 'i') }
      ].filter(Boolean)
    };

    const records = await AgentAttendance.find({
      $and: [
        agentMatch,
        { date: { $gte: fromStr, $lte: toStr } }
      ]
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
      status: 'present' | 'absent';
    }[] = [];

    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dateStr = toLocalDateStr(cur); // LOCAL date string
      const record = records.find((r) => r.date === dateStr);

      if (record && (record.punchIn || (record.activeSeconds && record.activeSeconds > 0))) {
        const punchIn = record.punchIn ? new Date(record.punchIn) : (record.createdAt ? new Date(record.createdAt) : new Date());
        const punchOut = record.punchOut ? new Date(record.punchOut) : null;
        
        let activeSecs = record.activeSeconds || 0;
        if (activeSecs === 0 && punchIn) {
          const endRef = punchOut || (record.lastActiveAt ? new Date(record.lastActiveAt) : new Date());
          const elapsedSecs = Math.max(0, Math.round((endRef.getTime() - punchIn.getTime()) / 1000));
          if (elapsedSecs > 0) {
            activeSecs = elapsedSecs;
          }
        }

        const totalMinutes = punchOut
          ? Math.max(1, Math.round((punchOut.getTime() - punchIn.getTime()) / 60000))
          : Math.max(0, Math.round(activeSecs / 60));

        allDays.push({
          date: dateStr,
          punchIn: record.punchIn ? new Date(record.punchIn).toISOString() : undefined,
          punchOut: punchOut ? punchOut.toISOString() : undefined,
          totalMinutes,
          activeSeconds: activeSecs,
          activeFormatted: formatDuration(activeSecs),
          lastActiveAt: record.lastActiveAt ? new Date(record.lastActiveAt).toISOString() : undefined,
          sessionCount: record.sessionCount || 1,
          status: 'present',
        });
      } else {
        // No punch-in record -> Always mark as Absent (rotational off policy: no mandatory Sunday Day Off)
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
  props: { params: Promise<{ agentId: string }> | { agentId: string } }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(props.params);
    const agentId = String(resolvedParams?.agentId || '');
    const todayStr = toLocalDateStr(new Date()); // LOCAL date

    const record = await AgentAttendance.findOne({
      $or: [
        { agentId },
        { agentId: agentId.toUpperCase() },
        { agentId: agentId.toLowerCase() }
      ],
      date: todayStr
    });
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
