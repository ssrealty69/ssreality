'use client';

import { useState } from 'react';
import { Edit, Trash2, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface BlogsTableProps {
  initialBlogs: any[];
}

export default function BlogsTable({ initialBlogs }: BlogsTableProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique categories for filter
  const categories = Array.from(new Set(blogs.map((b) => b.category || 'General')));

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      (blog.excerpt || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? blog.category === categoryFilter : true;
    
    let matchesStatus = true;
    if (publishedFilter) {
      matchesStatus = blog.status === publishedFilter || (!blog.status && blog.published && publishedFilter === 'published') || (!blog.status && !blog.published && publishedFilter === 'draft');
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b._id.toString() !== id));
        toast.success('Blog post deleted successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete blog post');
      }
    } catch (error) {
      toast.error('An error occurred during deletion');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by title or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <p className="font-medium text-gray-700">No blog posts found</p>
                    <p className="text-sm mt-1">Try resetting your search filters or click "Add Blog Post" to publish a new article.</p>
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog: any) => (
                  <tr key={blog._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#1A1800]">{blog.title}</p>
                      <p className="text-sm text-gray-500">/{blog.slug}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                        {blog.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`capitalize text-xs font-bold px-2 py-1 rounded-full ${
                        (blog.status === 'published' || (!blog.status && blog.published)) ? 'bg-green-100 text-green-700' : 
                        blog.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {blog.status || (blog.published ? 'published' : 'draft')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(blog.publishDate || blog.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4 text-right space-x-1 sm:space-x-2">
                      <Link 
                        href={`/admin/blogs/edit/${blog._id}`}
                        className="p-2 inline-block text-gray-400 hover:text-[#C9A227] transition-colors rounded-lg hover:bg-gray-100"
                        title="Edit Blog"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id.toString(), blog.title)}
                        disabled={deletingId === blog._id.toString()}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                        title="Delete Blog"
                      >
                        {deletingId === blog._id.toString() ? (
                          <Loader2 size={18} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={18} />
                        )}
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
