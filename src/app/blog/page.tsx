import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BlogCard from '@/components/blog/BlogCard';
import type { Blog } from '@/types';

export const metadata: Metadata = {
  title: 'Blog & News | SS Realty',
  description: 'Stay updated with the latest real estate news, market trends, investment tips, and property guides from SS Realty.',
};

// ISR — revalidate every hour
export const revalidate = 3600;

import { getAllBlogs } from '@/lib/blog-service';

async function getBlogs(category?: string): Promise<Blog[]> {
  const { data } = await getAllBlogs(category, 9, 1);
  return data;
}

const CATEGORIES = ['All', 'Market Trends', 'Investment', 'Legal', 'Home Tips', 'NRI'];

async function BlogPageContent({ currentCategory }: { currentCategory: string }) {
  const blogs = await getBlogs(currentCategory);

  return (
    <div>
      {/* Category pills */}
      <div className="flex flex-wrap gap-3 mb-10">
        {CATEGORIES.map((c) => (
          <Link 
            key={c}
            href={c === 'All' ? '/blog' : `/blog?category=${encodeURIComponent(c)}`}
            className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border transition-all ${
              c === currentCategory
                ? 'bg-[#C9A227] text-white border-[#C9A227] shadow-lg shadow-[#C9A227]/20'
                : 'border-[#E8D5A3] text-[#6b6450] hover:border-[#C9A227] hover:text-[#C9A227] bg-white'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {blogs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => <BlogCard key={b._id} blog={b} />)}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-[#E8D5A3]">
          <p className="text-xl font-semibold text-[#1A1800] mb-2">No posts in this category</p>
          <p className="text-sm text-[#a09060]">We&apos;re working on great content. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

export default function BlogPage({ searchParams }: { searchParams: { category?: string } }) {
  const currentCategory = searchParams.category || 'All';

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Header */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/90 via-[#1A1800]/85 to-[#1A1800]/75" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFEF5] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="gold-divider mb-5" />
          <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] text-white mb-4">
            Blog & <span className="text-[#C9A227]">Insights</span>
          </h1>
          <p className="text-[#d4c490] text-lg max-w-xl">
            Real estate news, market trends, investment tips, and property guides from our experts.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<div className="text-center py-20 text-[#C9A227]">Loading articles…</div>}>
          <BlogPageContent currentCategory={currentCategory} />
        </Suspense>
      </div>
    </div>
  );
}
