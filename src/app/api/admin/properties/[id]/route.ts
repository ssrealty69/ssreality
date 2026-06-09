import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import { invalidateCache } from '@/lib/redis';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const property = await Property.findById(id).lean();
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
          },
        }
      );
    }
    return NextResponse.json(
      { success: true, data: property },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    
    // Clean up highlights and nearby elements
    if (body.highlights) {
      body.highlights = body.highlights.filter((h: any) => typeof h === 'string' && h.trim() !== '');
    }
    if (body.nearby) {
      body.nearby = body.nearby.filter((n: any) => n.name.trim() !== '' && n.distance.trim() !== '');
    }
    if (body.images) {
      body.images = body.images.filter((img: string) => img.trim() !== '');
    }

    const property = await Property.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    // Invalidate Redis caches
    await invalidateCache(`property:${id}`);
    await invalidateCache('properties:*');

    // Invalidate Next.js static pages cache
    revalidatePath(`/properties/${id}`);
    revalidatePath('/');

    return NextResponse.json({ success: true, data: property });
  } catch (error: any) {
    console.error("Error updating property:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const property = await Property.findByIdAndDelete(id);
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    // Invalidate Redis caches
    await invalidateCache(`property:${id}`);
    await invalidateCache('properties:*');

    // Invalidate Next.js static pages cache
    revalidatePath(`/properties/${id}`);
    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
