import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { ids } = body || {};

    let result;
    if (ids && Array.isArray(ids) && ids.length > 0) {
      result = await JobApplication.updateMany(
        { _id: { $in: ids } },
        { $set: { isRead: true, status: 'viewed' } }
      );
    } else {
      result = await JobApplication.updateMany(
        { $or: [{ isRead: false }, { status: 'new' }, { isRead: { $exists: false } }] },
        { $set: { isRead: true, status: 'viewed' } }
      );
    }

    return NextResponse.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error: any) {
    console.error('Mark Jobs Read Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
