import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
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
    const blogs = await Blog.find({}).sort('-createdAt').lean();
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
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

    // Automatically generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Map authorName to Mongoose author schema structure if sent by creation form
    if (body.authorName && !body.author) {
      body.author = { name: body.authorName };
    }

    // Sync published boolean based on status to maintain legacy compatibility
    if (body.status === 'published') {
      body.published = true;
    } else {
      body.published = false;
    }

    const blog = await Blog.create(body);
    await invalidateCache('blogs:*');
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
