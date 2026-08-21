import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentSession from '@/models/AgentSession';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7).trim()
      : body.token || '';

    const {
      agentId,
      id,
      identifier,
      email,
      username,
      employeeId,
      employee_id,
      oldPassword,
      currentPassword,
      newPassword,
      password,
    } = body;

    const targetNewPassword = (newPassword || password || '').trim();
    const targetOldPassword = (oldPassword || currentPassword || '').trim();

    if (!targetNewPassword) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    if (targetNewPassword.length < 4) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 4 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    let agent = null;

    // 1. Try finding agent via Bearer token session
    if (token) {
      const session = await AgentSession.findOne({
        token,
        expiresAt: { $gt: new Date() },
      });
      if (session) {
        agent = await Agent.findById(session.agentId);
      }
    }

    // 2. Try finding agent by ID
    const targetId = agentId || id;
    if (!agent && targetId) {
      agent = await Agent.findById(targetId);
    }

    // 3. Try finding agent by username / email / employee_id / identifier
    const targetIdentifier = (identifier || email || username || employeeId || employee_id || '').trim();
    if (!agent && targetIdentifier) {
      agent = await Agent.findOne({
        $or: [
          { username: targetIdentifier.toLowerCase() },
          { employee_id: targetIdentifier },
          { employee_id: targetIdentifier.toUpperCase() },
        ],
      });
    }

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found or session expired' },
        { status: 404 }
      );
    }

    if (!agent.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Please contact admin.' },
        { status: 403 }
      );
    }

    // 4. Verify old password if provided or if no valid session token was used
    if (targetOldPassword) {
      const hashedOld = hashPassword(targetOldPassword, agent.salt);
      if (hashedOld !== agent.passwordHash && agent.plainPassword !== targetOldPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // 5. Update to new password
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(targetNewPassword, salt);

    agent.passwordHash = passwordHash;
    agent.salt = salt;
    agent.plainPassword = targetNewPassword;
    await agent.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        id: agent._id.toString(),
        name: agent.name,
        username: agent.username,
        employee_id: agent.employee_id,
        plainPassword: agent.plainPassword,
      },
    });
  } catch (error: any) {
    console.error('Change Password Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
