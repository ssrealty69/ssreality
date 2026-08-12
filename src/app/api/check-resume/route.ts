import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const app = await JobApplication.findOne({ name: 'Ritesh Kumar' });
    return NextResponse.json({ success: true, resumeUrl: app?.resumeUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
