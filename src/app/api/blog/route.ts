import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { getCached, setCached } from '@/lib/redis';
import { getAllBlogs } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const category = searchParams.get('category') || '';

    // Cache key for blog data
    const cacheKey = `blogs:v2:${page}:${limit}:${category}`;
    
    try {
      const cached: any = await getCached(cacheKey);
      if (cached && cached.data && cached.data.length > 0) {
        return NextResponse.json(cached);
      }
    } catch (e) {
      console.warn('Redis cache error:', e);
    }

    const { data, total } = await getAllBlogs(category, limit, page);

    const response = { 
      success: true, 
      data, 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit) 
    };

    // Cache the response if we have data
    if (data.length > 0) {
      try {
        await setCached(cacheKey, response, 600);
      } catch (e) {
        console.warn('Failed to set cache:', e);
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Final API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error'
    }, { status: 500 });
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
    const blog = await Blog.create(body);
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
