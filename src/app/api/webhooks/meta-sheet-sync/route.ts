import { NextRequest, NextResponse } from 'next/server';
import { fetchAndSyncGoogleSheets } from '@/lib/meta-sheets-service';
import { acquireLock } from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * Sync webhook for the Vercel cron, Google Apps Script, Zapier and Make.
 * Protected: Vercel cron sends `Authorization: Bearer $CRON_SECRET`; other callers
 * may send the same value via `x-webhook-secret` or `?secret=`.
 */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = req.headers.get('authorization');
  return (
    bearer === `Bearer ${secret}` ||
    req.headers.get('x-webhook-secret') === secret ||
    req.nextUrl.searchParams.get('secret') === secret
  );
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Burst guard: a spamming webhook can sync at most once per 30 seconds
  if (!(await acquireLock('meta_sheet_webhook_lock', 30))) {
    return NextResponse.json({ success: true, skipped: true, message: 'Synced recently, skipped.' });
  }

  try {
    const result = await fetchAndSyncGoogleSheets();
    return NextResponse.json({
      message: 'Google Sheets synced and leads distributed successfully!',
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error('Webhook Meta Sheet Sync Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
