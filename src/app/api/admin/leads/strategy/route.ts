import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const setting = await Setting.findOne({ key: 'lead_assignment_strategy' }).lean();
    return NextResponse.json({ 
      success: true, 
      strategy: setting ? (setting as any).value : 'manual' 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { strategy } = await req.json();
    if (!['manual', 'round_robin', 'least_assigned'].includes(strategy)) {
      return NextResponse.json({ success: false, error: 'Invalid strategy' }, { status: 400 });
    }
    
    await connectDB();
    await Setting.findOneAndUpdate(
      { key: 'lead_assignment_strategy' },
      { value: strategy },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, strategy });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
