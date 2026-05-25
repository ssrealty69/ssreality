'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AddBlog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    authorName: '',
    category: '',
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Blog created successfully in Database!');
        setTimeout(() => {
          router.push('/admin/blogs');
        }, 1000);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to create blog');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-[#1A1800]">Create New Blog Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
        
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="Blog post title" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="e.g. why-invest-in-noida" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" name="category" required value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="e.g. Market Trends" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea name="excerpt" required rows={2} value={formData.excerpt} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="Short summary for the blog card..."></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown or HTML)</label>
              <textarea name="content" required rows={10} value={formData.content} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none font-mono text-sm" placeholder="Write your blog content here..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
              <input type="text" name="authorName" required value={formData.authorName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="e.g. John Doe" />
            </div>

            <div className="flex items-center gap-3 pt-8">
              <input type="checkbox" id="published" name="published" checked={formData.published} onChange={handleChange} className="w-5 h-5 text-[#C9A227] rounded focus:ring-[#C9A227]" />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">Publish immediately</label>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold px-8 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70"
          >
            <Save size={20} />
            {loading ? 'Publishing...' : 'Save Blog Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
