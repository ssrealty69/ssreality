import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS handling for Mobile API
  if (pathname.startsWith('/api/mobile')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, x-agent-id, x-employee-id',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, x-agent-id, x-employee-id');
    return response;
  }

  // Protect /admin and /api/admin routes
  if ((pathname.startsWith('/admin') && pathname !== '/admin/login') || pathname.startsWith('/api/admin')) {
    // Only login and logout are exempt — seed is now a protected POST endpoint
    if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
      return NextResponse.next();
    }

    // Agent API routes use their own Bearer token auth — exempt from admin_token check
    if (pathname.startsWith('/api/agent')) {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token');
    const roleCookie = request.cookies.get('admin_role');
    const secretHeader = request.headers.get('x-admin-secret');
    const adminSecret = process.env.ADMIN_SECRET;

    const isAuthorized = (token && token.value === 'authenticated') || (adminSecret && secretHeader === adminSecret);

    if (!isAuthorized) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = roleCookie?.value || 'admin';
    const isSuperAdmin = role === 'super_admin';

    const restrictedPrefixes = [
      '/admin/properties',
      '/admin/floor-plans',
      '/admin/delivered-landmarks',
      '/admin/blogs',
      '/admin/marketing/tracking',
      '/api/admin/properties',
      '/api/admin/floor-plans',
      '/api/admin/delivered-landmarks',
      '/api/admin/blogs',
      '/api/admin/marketing/tracking'
    ];

    let isRestricted = false;
    
    if (pathname === '/admin' || pathname === '/api/admin/stats') {
      isRestricted = true;
    } else {
      for (const prefix of restrictedPrefixes) {
        if (pathname === prefix || pathname.startsWith(prefix + '/')) {
          isRestricted = true;
          break;
        }
      }
    }

    if (isRestricted && !isSuperAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      const fallbackUrl = new URL('/admin/leads', request.url);
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // Prevent logged-in admins from seeing the login page
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin_token');
    if (token && token.value === 'authenticated') {
      const dashboardUrl = new URL('/admin', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Match admin routes and mobile api
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/mobile/:path*'],
};
