'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BlogCard from '@/components/blog/BlogCard';
import type { Blog } from '@/types';
import { ChevronDown, Loader2, Sparkles, Filter } from 'lucide-react';

interface BlogListClientProps {
  initialBlogs: Blog[];
  initialTotal: number;
  initialCategory: string;
  categories: string[];
}

export default function BlogListClient({
  initialBlogs,
  initialTotal,
  initialCategory,
  categories,
}: BlogListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [total, setTotal] = useState<number>(initialTotal);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loadingCategory, setLoadingCategory] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  // Sync state if initialCategory or searchParams changes externally
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'All';
    if (categoryFromUrl !== activeCategory) {
      setActiveCategory(categoryFromUrl);
      fetchCategoryBlogs(categoryFromUrl);
    }
  }, [searchParams]);

  const fetchCategoryBlogs = async (category: string) => {
    setLoadingCategory(true);
    try {
      const res = await fetch(`/api/blog?category=${encodeURIComponent(category)}&limit=9&page=1`);
      const json = await res.json();
      if (json.success && json.data) {
        setBlogs(json.data);
        setTotal(json.total || json.data.length);
        setPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch category blogs:', err);
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (category === activeCategory) return;
    setActiveCategory(category);

    // Update URL query param
    const newUrl = category === 'All' ? '/blog' : `/blog?category=${encodeURIComponent(category)}`;
    router.push(newUrl, { scroll: false });

    fetchCategoryBlogs(category);
  };

  const handleLoadMore = async () => {
    if (loadingMore || blogs.length >= total) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(`/api/blog?category=${encodeURIComponent(activeCategory)}&limit=9&page=${nextPage}`);
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        setBlogs((prev) => {
          // Deduplicate by _id
          const existingIds = new Set(prev.map((b) => b._id.toString()));
          const newUnique = json.data.filter((b: Blog) => !existingIds.has(b._id.toString()));
          return [...prev, ...newUnique];
        });
        setTotal(json.total || total);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more blogs:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = blogs.length < total;
  const remainingCount = Math.max(0, total - blogs.length);

  return (
    <div className="space-y-12">
      {/* Category Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E8D5A3]/40 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a09060]">
          <Filter size={14} className="text-[#C9A227]" />
          <span>Filter by Topic:</span>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {categories.map((c) => {
            const isActive = c === activeCategory;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleCategoryClick(c)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#C9A227] text-[#1A1800] shadow-md shadow-[#C9A227]/25 ring-2 ring-[#C9A227]/30 scale-105'
                    : 'bg-white border border-[#E8D5A3] text-[#6b6450] hover:border-[#C9A227] hover:text-[#C9A227]'
                }`}
              >
                {isActive && <Sparkles size={12} className="text-[#1A1800]" />}
                <span>{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blogs Grid or Skeleton / Empty State */}
      {loadingCategory ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-6 border border-[#E8D5A3]/30 shadow-sm animate-pulse h-[400px] flex flex-col justify-between">
              <div className="bg-[#E8D5A3]/20 h-48 rounded-xl w-full" />
              <div className="space-y-3 pt-4">
                <div className="bg-[#E8D5A3]/30 h-4 rounded w-1/3" />
                <div className="bg-[#E8D5A3]/40 h-6 rounded w-5/6" />
                <div className="bg-[#E8D5A3]/20 h-4 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <BlogCard key={b._id} blog={b} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-[#E8D5A3]/60 shadow-sm">
          <p className="text-2xl font-bold text-[#1A1800] mb-2 font-[var(--font-playfair)]">No articles found in "{activeCategory}"</p>
          <p className="text-sm text-[#a09060] max-w-md mx-auto">
            We are working on bringing fresh real estate guides and market reports for this topic soon. Check back shortly!
          </p>
          <button
            onClick={() => handleCategoryClick('All')}
            className="mt-6 px-6 py-2.5 bg-[#C9A227] text-[#1A1800] font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#B8860B] transition-colors"
          >
            View All Articles
          </button>
        </div>
      )}

      {/* ── View More Button Section ── */}
      {hasMore && !loadingCategory && (
        <div className="pt-8 text-center flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#1A1800] to-[#2D2A00] text-[#F0D060] font-bold text-sm shadow-xl hover:shadow-[0_12px_30px_rgba(201,162,39,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-75 border border-[#C9A227]/40 cursor-pointer"
          >
            {loadingMore ? (
              <>
                <Loader2 size={18} className="animate-spin text-[#C9A227]" />
                <span>Loading Articles…</span>
              </>
            ) : (
              <>
                <span>View More Articles</span>
                {remainingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C9A227] text-[#1A1800] text-[11px] font-black">
                    +{remainingCount} More
                  </span>
                )}
                <div className="w-7 h-7 rounded-full bg-[#C9A227]/20 flex items-center justify-center group-hover:bg-[#C9A227] group-hover:text-[#1A1800] transition-colors">
                  <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                </div>
              </>
            )}
          </button>
          <p className="text-xs text-[#a09060] mt-3 font-medium">
            Showing {blogs.length} of {total} total articles
          </p>
        </div>
      )}

      {/* When all blogs are loaded */}
      {!hasMore && blogs.length > 9 && !loadingCategory && (
        <div className="pt-8 text-center border-t border-[#E8D5A3]/30">
          <p className="text-xs font-semibold text-[#a09060] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
            You've viewed all {total} articles in this category.
          </p>
        </div>
      )}
    </div>
  );
}
