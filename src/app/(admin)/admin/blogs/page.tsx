import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export const dynamic = 'force-dynamic';

export default async function AdminBlogs() {
  let blogs: any[] = [];
  let dbError = false;

  try {
    await connectDB();
    blogs = await Blog.find({}).sort('-createdAt').lean();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    dbError = true;
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {dbError && (
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
            <strong>Database Error:</strong> Could not connect to MongoDB. Please check if your current IP address is whitelisted in your Atlas cluster.
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Title</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <p>No blogs found.</p>
                    <p className="text-sm mt-2">Click "Add Blog Post" to create one.</p>
                  </td>
                </tr>
              ) : (
                blogs.map((blog: any) => (
                  <tr key={blog._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#1A1800]">{blog.title}</p>
                      <p className="text-sm text-gray-500">/{blog.slug}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                        {blog.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`capitalize text-xs font-bold px-2 py-1 rounded-full ${
                        blog.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-2 text-gray-400 hover:text-[#C9A227] transition-colors rounded-lg hover:bg-gray-100">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
