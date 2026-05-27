import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const secret = req.headers.get('x-admin-secret') || req.cookies.get('admin_token')?.value;
    if (secret !== process.env.ADMIN_SECRET && secret !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Fetch distinct categories from the Blog collection
    const categories = await Blog.distinct('category');
    
    // Sort alphabetically and filter out empty strings
    const sortedCategories = categories
      .filter((c): c is string => typeof c === 'string' && c.trim() !== '')
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ success: true, data: sortedCategories });
  } catch (error: any) {
    console.error('[Categories API Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
