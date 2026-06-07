import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import { invalidateCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const properties = await Property.find({}).sort('-createdAt').lean();
    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const property = await Property.create(body);
    await invalidateCache('properties:*');
    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating property:', error);
    const message = error instanceof Error ? error.message : 'Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
