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
  const R = 6371e3; // Earth radius in meters
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

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || body.email || body.username || '').toLowerCase().trim();
    const password = body.password || '';

    if (!identifier || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email / Employee ID and Password are required'
      }, { status: 400 });
    }

    await connectDB();

    // Strictly authenticate Team Members (Agents) created in /admin/agents
    const agent = await Agent.findOne({
      $or: [
        { username: identifier },
        { employee_id: identifier.toUpperCase() },
        { employee_id: identifier }
      ]
    });

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'This account is not registered in Team Members / Agents.'
      }, { status: 401 });
    }

    if (!agent.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Your team account is deactivated. Please contact your administrator.'
      }, { status: 403 });
    }

    const hashed = hashPassword(password, agent.salt);
    if (hashed !== agent.passwordHash) {
      return NextResponse.json({
        success: false,
        error: 'Incorrect password. Please check and try again.'
      }, { status: 401 });
    }

    // Auto-sync plainPassword in database so admin panel immediately has the latest password
    if (agent.plainPassword !== password) {
      try {
        agent.plainPassword = password;
        await agent.save();
      } catch (_) {}
    }

    // Generate tokens
    const token = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    try {
      await AgentSession.create({ agentId: agent._id.toString(), token, expiresAt });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Team Agent Login Successful',
      data: {
        token,
        refreshToken,
        user: {
          id: agent._id.toString(),
          fullName: agent.name,
          email: agent.username,
          employeeId: agent.employee_id,
          phone: '+919876543210',
          orgId: 'SSRealty',
          role: {
            name: 'Agent',
            slug: 'agent',
            permissions: {
              'leads.view.assigned': true,
              'calls.log': true,
              'reports.self': true,
            },
          },
          isActive: true,
        },
      },
    });

  } catch (error: any) {
    console.error('Team Agent Login Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}