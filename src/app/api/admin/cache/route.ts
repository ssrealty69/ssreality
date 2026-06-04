import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidateCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  // FIXED: Previously compared cookie token against ADMIN_SECRET (always false).
  // Now correctly checks cookie value OR header secret independently.
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Invalidate all property and blog caches
    await invalidateCache('properties:*');
    await invalidateCache('blogs:*');
    await invalidateCache('blog:*');
    await invalidateCache('property:*');

    // Clear Next.js cache
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, message: 'Cache successfully cleared' });
  } catch (error: unknown) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
