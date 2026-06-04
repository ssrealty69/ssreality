import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    await Property.deleteMany({ status: 'delivered' });
    return NextResponse.json({ success: true, message: 'All delivered properties deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
