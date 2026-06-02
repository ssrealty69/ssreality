import { connectDB } from '@/lib/mongodb';
import BlogModel from '@/models/Blog';
import { FALLBACK_BLOGS } from '@/lib/blogs';
import type { Blog } from '@/types';

export async function getAllBlogs(category?: string, limit: number = 9, page: number = 1): Promise<{ data: Blog[], total: number }> {
  let data: Blog[] = [];
  let total = 0;

  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { 
      $or: [
        { published: true }, // Legacy
        { status: 'published' },
        { status: 'scheduled', publishDate: { $lte: new Date() } }
      ]
    };
    if (category && category !== 'All') {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    
    // We cast to any because the model might have slight differences from the Blog interface
    // but we want to ensure it matches as closely as possible.
    const [dbData, dbTotal] = await Promise.all([
      BlogModel.find(filter).sort('-createdAt').skip(skip).limit(limit).lean() as any,
      BlogModel.countDocuments(filter),
    ]);

    data = dbData;
    total = dbTotal;
  } catch (dbError) {
    console.error('Database connection failed in blog-service, using fallbacks:', dbError);
  }

  // Always use fallback data if DB is empty or connection failed
  if (data.length === 0 && page === 1) {
    const filteredFallbacks = category && category !== 'All' 
      ? FALLBACK_BLOGS.filter((b: any) => b.category === category)
      : FALLBACK_BLOGS;
    
    data = filteredFallbacks.slice((page - 1) * limit, page * limit) as Blog[];
    total = filteredFallbacks.length;
  }

  return { data, total };
}
