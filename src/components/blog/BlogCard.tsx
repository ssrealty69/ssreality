import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';
import type { Blog } from '@/types';

interface BlogCardProps { blog: Blog; }

const CATEGORY_COLORS: Record<string, string> = {
  'Market Trends': 'bg-blue-50 text-blue-700',
  'Investment': 'bg-emerald-50 text-emerald-700',
  'Legal': 'bg-purple-50 text-purple-700',
  'Home Tips': 'bg-orange-50 text-orange-700',
  'NRI': 'bg-indigo-50 text-indigo-700',
};

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.slug}`} className="group block">
      <article className="bg-white rounded-[2rem] overflow-hidden border border-[#E8D5A3]/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(201,162,39,0.15)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
        {/* Image Container with Zoom and Overlay */}
        <div className="relative h-60 overflow-hidden bg-[#1A1800]">
          {/* Main Content Image */}
          <Image
            src={blog.coverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105 z-10"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
            quality={90}
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1800]/40 via-transparent to-transparent opacity-60" />

          {/* Glassmorphism Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
              <Tag size={10} className="fill-current" /> {blog.category}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-4 text-[11px] text-[#a09060] font-medium mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-[#C9A227]" />
              {formatDate(blog.publishDate || blog.createdAt)}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#E8D5A3]/60" />
            <span className="flex items-center gap-1.5">
              <User size={12} className="text-[#C9A227]" />
              {blog.author?.name || 'SS Realty'}
            </span>
          </div>

          <h3 className="font-[var(--font-playfair)] text-xl leading-tight text-[#1A1800] mb-3 group-hover:text-[#C9A227] transition-colors duration-300 line-clamp-2 font-bold">
            {blog.title}
          </h3>

          <p className="text-sm text-[#6b6450]/80 leading-relaxed line-clamp-2 mb-6">
            {truncate(blog.excerpt, 100)}
          </p>

          <div className="mt-auto pt-4 border-t border-[#E8D5A3]/20 flex items-center justify-between">
            <div className="flex items-center text-[#C9A227] text-xs font-bold gap-1 group-hover:gap-2 transition-all duration-300">
              READ ARTICLE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="w-8 h-8 rounded-full bg-[#C9A227]/5 flex items-center justify-center text-[#C9A227] group-hover:bg-[#C9A227] group-hover:text-white transition-all duration-300 shadow-inner">
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
