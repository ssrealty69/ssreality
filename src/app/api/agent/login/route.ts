import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentSession from '@/models/AgentSession';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username aur password zaroori hai' }, { status: 400 });
    }

    await connectDB();
    const agent = await Agent.findOne({ username: username.toLowerCase().trim(), isActive: true });

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const hashed = hashPassword(password, agent.salt);
    if (hashed !== agent.passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await AgentSession.create({ agentId: agent._id.toString(), token, expiresAt });

    return NextResponse.json({
      success: true,
      token,
      agent: {
        id: agent._id.toString(),
        name: agent.name,
        username: agent.username,
      },
    });
  } catch (err: any) {
    console.error('Agent Login Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
