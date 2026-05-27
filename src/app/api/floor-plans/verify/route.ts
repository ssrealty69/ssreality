import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { passcode } = body;

    if (!passcode) {
      return NextResponse.json({ success: false, error: 'Passcode is required' }, { status: 400 });
    }

    // Retrieve setting
    let dbPasscode = '123456';
    const passcodeSetting = await Setting.findOne({ key: 'floorview_passcode' }).lean();
    
    if (passcodeSetting) {
      dbPasscode = passcodeSetting.value;
    }

    if (passcode === dbPasscode) {
      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect passcode' }, { status: 401 });
    }
  } catch (error) {
    console.error('Verify passcode error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
