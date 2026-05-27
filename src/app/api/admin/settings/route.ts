import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let passcode = '123456';
    const passcodeSetting = await Setting.findOne({ key: 'floorview_passcode' }).lean();
    if (passcodeSetting) {
      passcode = passcodeSetting.value;
    }

    return NextResponse.json({ success: true, passcode });
  } catch (error) {
    console.error('Fetch admin settings error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { passcode } = body;

    // Validate the passcode format (must be 6-digit numeric)
    if (!passcode || typeof passcode !== 'string' || !/^\d{6}$/.test(passcode)) {
      return NextResponse.json({ success: false, error: 'Passcode must be exactly 6 numeric digits' }, { status: 400 });
    }

    const updatedSetting = await Setting.findOneAndUpdate(
      { key: 'floorview_passcode' },
      { value: passcode },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, passcode: updatedSetting.value });
  } catch (error) {
    console.error('Save admin setting error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
