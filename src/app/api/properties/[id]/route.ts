import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import { getCached, setCached, invalidateCache } from '@/lib/redis';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `property:${id}`;
    const cached = await getCached(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached });

    await connectDB();
    const property = await Property.findById(id).lean();
    if (!property) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // Increment views
    await Property.findByIdAndUpdate(id, { $inc: { views: 1 } });

    await setCached(cacheKey, property, 600);
    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const property = await Property.findByIdAndUpdate(id, body, { new: true }).lean();
    await invalidateCache(`property:${id}`);
    await invalidateCache('properties:*');
    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    await Property.findByIdAndDelete(id);
    await invalidateCache(`property:${id}`);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
