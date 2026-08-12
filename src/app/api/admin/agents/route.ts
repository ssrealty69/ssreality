import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
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

// GET: List all agents
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const agents = await Agent.find({}).select('-passwordHash -salt').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: agents });
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

    const agent = await Agent.create({ name, username: username.toLowerCase().trim(), passwordHash, salt, employee_id: employee_id.trim() });
    return NextResponse.json({
      success: true,
      data: { id: agent._id, name: agent.name, username: agent.username, employee_id: agent.employee_id, isActive: agent.isActive },
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
  return NextResponse.json({ success: true, message: 'Agent deleted' });
}
