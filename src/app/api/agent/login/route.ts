import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentSession from '@/models/AgentSession';
import AgentAttendance from '@/models/AgentAttendance';
import AgentLocationLog from '@/models/AgentLocationLog';
import { getGeofenceSettings } from '@/lib/geofenceConfig';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function getISTDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, latitude, longitude, address, deviceId, deviceModel } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    await connectDB();
    const agent = await Agent.findOne({
      $or: [
        { username: username.toLowerCase().trim() },
        { employee_id: username.toUpperCase().trim() },
        { employee_id: username.trim() }
      ]
    });

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!agent.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Your team account is deactivated. Please contact your administrator.'
      }, { status: 403 });
    }

    const hashed = hashPassword(password, agent.salt);
    if (hashed !== agent.passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Auto-sync plainPassword in database so admin panel immediately has the latest password
    if (agent.plainPassword !== password) {
      try {
        agent.plainPassword = password;
        await agent.save();
      } catch (_) {}
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
        employee_id: agent.employee_id,
      },
    });
  } catch (err: any) {
    console.error('Agent Login Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
