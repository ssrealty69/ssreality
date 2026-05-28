import { NextRequest, NextResponse } from 'next/server';
import { loginLimiter, getClientIp } from '@/lib/rateLimit';

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
    const { password } = body;

    // Never fall back to a hardcoded password — require env var in all environments
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      console.error('ADMIN_SECRET environment variable is not configured.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (password === adminSecret) {
      const response = NextResponse.json(
        { success: true },
        { status: 200, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );

      response.cookies.set({
        name: 'admin_token',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',   // Changed from 'lax' → 'strict' to prevent CSRF
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours (reduced from 7 days for security)
      });

      return response;
    }

    // Use a generic message — do not confirm whether username or password was wrong
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
