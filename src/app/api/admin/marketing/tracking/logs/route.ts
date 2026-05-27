import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import EventLog from '@/models/EventLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Fetch latest 10 event logs
    const logs = await EventLog.find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    console.error('Fetch Event Logs Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Clear all logs
    await EventLog.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'Telemetry event logs cleared successfully'
    });
  } catch (error: any) {
    console.error('Clear Event Logs Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
