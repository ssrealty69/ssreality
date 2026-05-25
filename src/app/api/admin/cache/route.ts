import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-admin-secret') || req.cookies.get('admin_token')?.value;
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Invalidate all property and blog caches
    await invalidateCache('properties:*');
    await invalidateCache('blogs:*');

    return NextResponse.json({ success: true, message: 'Cache successfully cleared' });
  } catch (error: any) {
    console.error("Error clearing cache:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
