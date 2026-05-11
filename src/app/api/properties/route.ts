import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import { getCached, setCached } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const city = searchParams.get('city') || '';
    const propertyType = searchParams.get('propertyType') || '';
    const priceType = searchParams.get('priceType') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const bedrooms = searchParams.get('bedrooms') || '';
    const status = searchParams.get('status') || 'available';
    const featured = searchParams.get('featured') || '';
    const query = searchParams.get('query') || '';
    const sort = searchParams.get('sort') || '-createdAt';

    const cacheKey = `properties:${JSON.stringify({ page, limit, city, propertyType, priceType, minPrice, maxPrice, bedrooms, status, featured, query, sort })}`;
    const cached = await getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    await connectDB();

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (propertyType) filter.propertyType = propertyType;
    if (priceType) filter.priceType = priceType;
    if (bedrooms) filter['features.bedrooms'] = parseInt(bedrooms);
    if (featured === 'true') filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (query) {
      filter.$text = { $search: query };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Property.countDocuments(filter),
    ]);

    const response = {
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await setCached(cacheKey, response, 300); // 5 min cache
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const property = await Property.create(body);
    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
