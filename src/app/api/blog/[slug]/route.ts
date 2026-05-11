import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { getCached, setCached } from '@/lib/redis';
import { FALLBACK_BLOGS } from '@/lib/blogs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cacheKey = `blog:${slug}`;
    const cached = await getCached(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached });

    let blog;
    try {
      await connectDB();
      blog = await Blog.findOne({ slug, published: true }).lean();
      if (blog) {
        await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
      }
    } catch (dbError) {
      console.error('Database error in blog slug route:', dbError);
    }

    // Fallback if not found in DB
    if (!blog) {
      blog = FALLBACK_BLOGS.find(b => b.slug === slug);
    }

    if (!blog) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    await setCached(cacheKey, blog, 600);
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
