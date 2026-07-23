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
        { status: 'scheduled' },
        { status: 'draft' }
      ]
    };
    if (category && category !== 'All') {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    
    // We compute effectiveDate dynamically so posts missing publishDate fallback to createdAt
    const [dbData, dbTotal] = await Promise.all([
      BlogModel.aggregate([
        { $match: filter },
        {
          $addFields: {
            effectiveDate: { $ifNull: ["$publishDate", "$createdAt"] }
          }
        },
        { $sort: { effectiveDate: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]) as any,
      BlogModel.countDocuments(filter),
    ]);

    data = dbData;
    total = dbTotal;
  } catch (dbError) {
    console.error('Database connection failed in blog-service, using fallbacks:', dbError);
  }

  // Always use fallback data if DB is empty or connection failed
  if (data.length === 0 && page === 1) {
    const getEffectiveTime = (b: any) => {
      const d = b.publishDate || b.createdAt;
      return d ? new Date(d).getTime() : 0;
    };

    const filteredFallbacks = category && category !== 'All' 
      ? FALLBACK_BLOGS.filter((b: any) => b.category === category)
      : FALLBACK_BLOGS;
    
    const sortedFallbacks = [...filteredFallbacks].sort((a: any, b: any) => getEffectiveTime(b) - getEffectiveTime(a));

    data = sortedFallbacks.slice((page - 1) * limit, page * limit) as Blog[];
    total = filteredFallbacks.length;
  }

  return { data, total };
}
