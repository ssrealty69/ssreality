import { NextRequest, NextResponse } from 'next/server';
import { loginLimiter, getClientIp } from '@/lib/rateLimit';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import Agent from '@/models/Agent';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  // ── Rate limiting: 5 attempts per 15 minutes per IP ──────────────────────
  const ip = getClientIp(request);
  const { success, remaining, retryAfter } = loginLimiter.check(ip);

  if (!success) {
    return NextResponse.json(
      { error: `Too many login attempts. Please try again in ${retryAfter} seconds.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();
    
    // First try Admin
    let userRole = 'admin';
    let userId = '';
    let user = await Admin.findOne({ email: email.toLowerCase().trim(), isActive: true });

    if (user) {
      const hashed = hashPassword(password, user.salt);
      if (hashed !== user.passwordHash) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      userRole = user.role;
      userId = user._id.toString();
    } else {
      // Try Agent
      user = await Agent.findOne({ username: email.toLowerCase().trim(), isActive: true });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const hashed = hashPassword(password, user.salt);
      if (hashed !== user.passwordHash) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      userRole = 'agent';
      userId = user._id.toString();
    }

    const response = NextResponse.json(
      { success: true, role: userRole },
      { status: 200, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );

    response.cookies.set({
      name: 'admin_token',
      value: 'authenticated',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set({
      name: 'admin_role',
      value: userRole,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    
    response.cookies.set({
      name: 'admin_user_id',
      value: userId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
