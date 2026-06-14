import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// POST /api/admin/migrate-slugs - backfill slugs for all existing properties
export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();

    // Find all properties without a slug
    const properties = await Property.find({ slug: { $exists: false } }).lean();
    const noSlug = properties;
    
    // Also find all properties (to update even those with empty slug)
    const allProperties = await Property.find({}).lean();
    const withEmptySlug = allProperties.filter((p: any) => !p.slug);

    const toUpdate = withEmptySlug.length > 0 ? withEmptySlug : noSlug;

    let updated = 0;
    for (const prop of toUpdate as any[]) {
      const base = slugify(prop.title);
      const slug = base + '-' + prop._id.toString().slice(-6);
      await Property.findByIdAndUpdate(prop._id, { slug });
      updated++;
    }

    // Also update all properties that already have slug but it's wrong (optional full refresh)
    const forceRefresh = req.nextUrl?.searchParams?.get('force') === '1';
    if (forceRefresh) {
      const all = await Property.find({}).lean() as any[];
      for (const prop of all) {
        const base = slugify(prop.title);
        const slug = base + '-' + prop._id.toString().slice(-6);
        await Property.findByIdAndUpdate(prop._id, { slug });
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} properties with slugs`,
      updated,
    });
  } catch (error) {
    console.error('Slug migration error:', error);
    return NextResponse.json({ success: false, error: 'Migration failed' }, { status: 500 });
  }
}
