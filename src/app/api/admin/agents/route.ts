import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentSession from '@/models/AgentSession';
import AgentAttendance from '@/models/AgentAttendance';
import { localToday } from '@/lib/dateUtils';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export const dynamic = 'force-dynamic';

// GET: List all agents with live online status & screen time
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const agents = await Agent.find({}).select('-passwordHash -salt').sort({ createdAt: -1 }).lean();

  const todayStr = localToday();
  const attendances = await AgentAttendance.find({ date: todayStr }).lean();
  const attendanceMap = new Map<string, any>();
  attendances.forEach((att: any) => {
    attendanceMap.set(att.agentId.toString(), att);
  });

  const nowMs = Date.now();
  const ONLINE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes

  const enrichedAgents = agents.map((agent: any) => {
    const att = attendanceMap.get(agent._id.toString());
    const lastActive = att?.lastActiveAt ? new Date(att.lastActiveAt) : null;
    const isOnline = lastActive ? (nowMs - lastActive.getTime() < ONLINE_THRESHOLD_MS) : false;
    const activeSeconds = att?.activeSeconds || 0;

    let activeFormatted = '0m';
    if (activeSeconds > 0) {
      const h = Math.floor(activeSeconds / 3600);
      const m = Math.floor((activeSeconds % 3600) / 60);
      if (h > 0) activeFormatted = `${h}h ${m}m`;
      else activeFormatted = `${m}m`;
    }

    return {
      ...agent,
      todayActiveSeconds: activeSeconds,
      todayActiveFormatted: activeFormatted,
      isOnline,
      lastActiveAt: lastActive ? lastActive.toISOString() : null,
      punchIn: att?.punchIn ? new Date(att.punchIn).toISOString() : null,
      punchOut: att?.punchOut ? new Date(att.punchOut).toISOString() : null,
      totalMinutes: att?.totalMinutes || 0,
      sessionCount: att?.sessionCount || 0,
    };
  });

  return NextResponse.json({ success: true, data: enrichedAgents });
}

// POST: Create new agent
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name, username, password, employee_id } = await req.json();
    if (!name || !username || !password || !employee_id) {
      return NextResponse.json({ success: false, error: 'Name, email, password and Employee ID are required' }, { status: 400 });
    }

    await connectDB();
    const exists = await Agent.findOne({ 
      $or: [
        { username: username.toLowerCase().trim() }, 
        { employee_id: employee_id.trim() }
      ] 
    });
    
    if (exists) {
      if (exists.username === username.toLowerCase().trim()) {
        return NextResponse.json({ success: false, error: 'Email already taken' }, { status: 409 });
      }
      if (exists.employee_id === employee_id.trim()) {
        return NextResponse.json({ success: false, error: 'Employee ID already taken' }, { status: 409 });
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const agent = await Agent.create({ 
      name, 
      username: username.toLowerCase().trim(), 
      passwordHash, 
      salt, 
      plainPassword: password, 
      employee_id: employee_id.trim() 
    });
    return NextResponse.json({
      success: true,
      data: { 
        id: agent._id, 
        name: agent.name, 
        username: agent.username, 
        employee_id: agent.employee_id, 
        plainPassword: agent.plainPassword, 
        isActive: agent.isActive 
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Toggle agent active status
export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, isActive } = await req.json();
    await connectDB();
    await Agent.findByIdAndUpdate(id, { isActive });
    
    // Revoke all active sessions if agent is deactivated
    if (!isActive) {
      await AgentSession.deleteMany({ agentId: id });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove agent
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
  await connectDB();
  await Agent.findByIdAndDelete(id);
  await AgentSession.deleteMany({ agentId: id });
  return NextResponse.json({ success: true, message: 'Agent deleted' });
}

// PUT: Update agent details (name, username/email, employee_id, optional new password)
export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, name, username, employee_id, newPassword, allowRemotePunchIn } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Agent ID required' }, { status: 400 });

    await connectDB();

    // Check for duplicate username/employee_id (exclude current agent)
    if (username || employee_id) {
      const conflict = await Agent.findOne({
        _id: { $ne: id },
        $or: [
          ...(username ? [{ username: username.toLowerCase().trim() }] : []),
          ...(employee_id ? [{ employee_id: employee_id.trim() }] : []),
        ],
      });
      if (conflict) {
        if (username && conflict.username === username.toLowerCase().trim()) {
          return NextResponse.json({ success: false, error: 'Email already used by another agent' }, { status: 409 });
        }
        if (employee_id && conflict.employee_id === employee_id.trim()) {
          return NextResponse.json({ success: false, error: 'Employee ID already used by another agent' }, { status: 409 });
        }
      }
    }

    const updateFields: Record<string, any> = {};
    if (name) updateFields.name = name.trim();
    if (username) updateFields.username = username.toLowerCase().trim();
    if (employee_id) updateFields.employee_id = employee_id.trim();
    if (typeof body.allowRemotePunchIn === 'boolean') {
      updateFields.allowRemotePunchIn = body.allowRemotePunchIn;
    }

    // Update password if provided
    if (newPassword && newPassword.trim().length > 0) {
      const salt = crypto.randomBytes(16).toString('hex');
      updateFields.passwordHash = hashPassword(newPassword.trim(), salt);
      updateFields.salt = salt;
      updateFields.plainPassword = newPassword.trim();
    }

    const updated = await Agent.findByIdAndUpdate(id, updateFields, { new: true })
      .select('-passwordHash -salt');

    if (!updated) return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
