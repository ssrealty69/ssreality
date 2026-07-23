import { Plus } from 'lucide-react';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import BlogsTable from '@/components/admin/BlogsTable';
import { FALLBACK_BLOGS } from '@/lib/blogs';

export const dynamic = 'force-dynamic';

export default async function AdminBlogs() {
  let blogs: any[] = [];
  let dbError = false;

  try {
    await connectDB();
    // Sort by effectiveDate DESC (publishDate || createdAt)
    const rawBlogs = await Blog.aggregate([
      {
        $addFields: {
          effectiveDate: { $ifNull: ["$publishDate", "$createdAt"] }
        }
      },
      { $sort: { effectiveDate: -1 } }
    ]);
    blogs = JSON.parse(JSON.stringify(rawBlogs));
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    dbError = true;
  }

  // Fallback to demo blogs when MongoDB connection fails so local testing works seamlessly
  if (dbError || blogs.length === 0) {
    const getEffectiveTime = (b: any) => {
      const d = b.publishDate || b.createdAt;
      return d ? new Date(d).getTime() : 0;
    };
    blogs = [...FALLBACK_BLOGS]
      .map(b => ({
        ...b,
        _id: b._id.toString(),
        createdAt: b.createdAt || new Date().toISOString(),
        updatedAt: b.updatedAt || new Date().toISOString(),
      }))
      .sort((a, b) => getEffectiveTime(b) - getEffectiveTime(a));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1800]">Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your website's articles and news</p>
        </div>
        <Link 
          href="/admin/blogs/new" 
          className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add Blog Post</span>
        </Link>
      </div>

      {dbError && (
        <div className="bg-red-50 p-4 border border-red-100 rounded-2xl flex items-center gap-2 text-red-700 text-sm">
          <strong>Database Error:</strong> Could not connect to MongoDB. Please check if your current IP address is whitelisted in your Atlas cluster.
        </div>
      )}

      <BlogsTable initialBlogs={blogs} />
    </div>
  );
}
