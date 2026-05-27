import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getTrackingSettings } from '@/lib/tracking-service';
import EventLog from '@/models/EventLog';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const settings = await getTrackingSettings();
    if (!settings || !settings.isEnabled || !settings.enableEventLog) {
      return NextResponse.json({ success: false, error: 'Logging is disabled' }, { status: 400 });
    }

    const body = await req.json();
    const { eventName, parameters = {}, sessionId = '', page = '' } = body;

    if (!eventName) {
      return NextResponse.json({ success: false, error: 'Event name is required' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Simple IP anonymisation (e.g. 192.168.1.123 -> 192.168.1.0)
    let ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    const ipParts = ipAddress.split('.');
    if (ipParts.length === 4) {
      ipParts[3] = '0';
      ipAddress = ipParts.join('.');
    }

    await connectDB();
    const event = await EventLog.create({
      eventName,
      parameters,
      sessionId,
      userAgent,
      ipAddress,
      page,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    console.error('Server Event Log Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
