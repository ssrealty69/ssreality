import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import { invalidateCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const properties = await Property.find({}).sort('-createdAt').lean();
    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Convert string fields to expected types if necessary
    // Mongoose handles most casting automatically
    
    const property = await Property.create(body);

    // Invalidate properties list cache so the new property shows up on public site
    await invalidateCache('properties:*');

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating property:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
