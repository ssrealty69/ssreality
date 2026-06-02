'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, AlertCircle, Plus, RefreshCw, FolderPlus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { BlogContentEditor } from '@/components/admin/BlogContentEditor';
import { SeoControlPanel } from '@/components/admin/SeoControlPanel';

export default function AddBlog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Blog Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    authorName: 'SS Realty Expert', // Brand default author
    category: '',
    status: 'draft',
    publishDate: '',
  });

  // SEO Control Panel State
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: '',
    focusKeyword: '',
    canonicalUrl: '',
  });

  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Track if slug was manually edited to keep auto-generator functional
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Load distinct categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/admin/blogs/categories');
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
          // Set first category as default if available
          if (json.data.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: json.data[0] }));
          }
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, [formData.category]);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, title: titleVal };
      if (!isSlugEdited) {
        updated.slug = titleVal
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugEdited(true);
    setFormData(prev => ({ ...prev, slug: e.target.value }));
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

  // Add Dynamic Custom Category
  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCategory = newCategoryName.trim();
    if (!cleanCategory) {
      toast.error('Category name cannot be empty!');
      return;
    }

    if (categories.includes(cleanCategory)) {
      toast.error('This category already exists!');
      setFormData(prev => ({ ...prev, category: cleanCategory }));
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      return;
    }

    // Add to list and select it
    setCategories(prev => [...prev, cleanCategory].sort((a, b) => a.localeCompare(b)));
    setFormData(prev => ({ ...prev, category: cleanCategory }));
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    toast.success(`Category "${cleanCategory}" added!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coverImage) {
      toast.error('Please upload a primary cover image thumbnail for your blog post.');
      return;
    }

    if (!formData.category) {
      toast.error('Please select or create a category.');
      return;
    }

    if (!formData.content || formData.content.trim() === '<p></p>' || formData.content.trim() === '') {
      toast.error('Please write some content inside your rich text editor.');
      return;
    }

    setLoading(true);

    try {
      // Map properties matching DB expectations + embed SEO sub-object
      const payload = {
        ...formData,
        publishDate: formData.status === 'scheduled' && formData.publishDate ? new Date(formData.publishDate).toISOString() : null,
        seo: seoData,
        author: {
          name: formData.authorName
        }
      };

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Blog post published successfully!');
        setTimeout(() => {
          router.push('/admin/blogs');
          router.refresh();
        }, 1000);
      } else {
        toast.error(json.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('[Blog Submit Error]', error);
      toast.error('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1800] flex items-center gap-2">
              <Sparkles className="text-[#C9A227]" size={22} />
              Create Premium Blog Post
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Publish market reports, property guides, and local updates.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Core Metadata Settings */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-50">
            1. Core Blog Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Blog Post Title</label>
              <input 
                type="text" 
                required 
                value={formData.title} 
                onChange={handleTitleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white" 
                placeholder="e.g. Why Noida Expressway Commercial Properties are Booming in 2026" 
              />
            </div>
            
            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dynamic URL Slug</label>
              <input 
                type="text" 
                required 
                value={formData.slug} 
                onChange={handleSlugChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white font-mono" 
                placeholder="e.g. why-invest-in-noida" 
              />
              <p className="text-[10px] text-gray-400 mt-1">Unique URL path. Automatically formats as you write Title.</p>
            </div>
            
            {/* Categories */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">Category Select</label>
              
              {!showNewCategoryInput ? (
                <div className="flex gap-2">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
                  >
                    <option value="" disabled>-- Select a Topic Category --</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="px-3.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors text-xs font-bold whitespace-nowrap"
                    title="Add dynamic custom category"
                  >
                    <Plus size={14} />
                    <span>New</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 animate-scale-in">
                  <input 
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Type new category..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="px-4 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] rounded-lg transition-colors text-xs font-bold flex items-center justify-center"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                    }}
                    className="px-3 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Post Excerpt / Brief Summary</label>
              <textarea 
                name="excerpt" 
                required 
                rows={2} 
                value={formData.excerpt} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white" 
                placeholder="A compelling, short summary displayed in listing cards and social previews..."
              />
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Author Name</label>
              <input 
                type="text" 
                name="authorName" 
                required 
                value={formData.authorName} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white" 
                placeholder="e.g. Pawan SS Realty" 
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Post Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
              >
                <option value="draft">Draft (Save for later)</option>
                <option value="published">Published (Make live immediately)</option>
                <option value="scheduled">Scheduled (Auto-publish at future date)</option>
              </select>
            </div>

            {/* Scheduled Date Picker */}
            {formData.status === 'scheduled' && (
              <div className="animate-fade-in-up">
                <label className="block text-xs font-bold text-gray-700 mb-1">Schedule Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="publishDate" 
                  required 
                  value={formData.publishDate} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white" 
                />
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: Media Cover Image Thumbnail */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-50">
            2. Blog Main Banner Cover Image
          </h2>
          <MediaUpload 
            label="Upload Thumbnail Cover Image"
            description="Upload the primary banner photo for this blog post. Displays on lists and top of page. Ratio: 16:9 recommended."
            value={formData.coverImage}
            onChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
            folder="ss-realty/blog"
          />
        </section>

        {/* SECTION 3: Rich-Text Editor Content */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-50">
            3. Detailed Blog Article Content
          </h2>
          <BlogContentEditor 
            value={formData.content}
            onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
            placeholder="Write your article. Use toolbar to format text, add colors, insert hyperlinks, or embed images dynamically..."
          />
        </section>

        {/* SECTION 4: SEO Control Panel & Meta Analyzer */}
        <SeoControlPanel 
          data={seoData}
          onChange={setSeoData}
          defaultTitle={formData.title}
          defaultExcerpt={formData.excerpt}
          defaultSlug={formData.slug}
        />

        {/* Action Form Footer */}
        <div className="flex justify-end pt-4 gap-4">
          <Link 
            href="/admin/blogs" 
            className="px-6 py-3 border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors text-xs font-bold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold px-10 py-3.5 rounded-lg transition-all shadow-md active:scale-[0.99] disabled:opacity-70 text-xs font-black uppercase tracking-wider"
          >
            <Save size={16} />
            {loading ? 'Saving Post...' : 'Save & Publish Post'}
          </button>
        </div>
        
      </form>
    </div>
  );
}
