import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Tag, Clock, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Blog } from '@/types';
import { connectDB } from '@/lib/mongodb';
import BlogModel from '@/models/Blog';
import { FALLBACK_BLOGS } from '@/lib/blogs';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    await connectDB();
    let blog = await BlogModel.findOne({ 
      slug, 
      $or: [
        { published: true }, // Legacy
        { status: 'published' },
        { status: 'scheduled', publishDate: { $lte: new Date() } }
      ]
    }).lean() as any;
    if (blog) {
      BlogModel.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec().catch(() => {});
    } else {
      blog = FALLBACK_BLOGS.find(b => b.slug === slug);
    }
    return JSON.parse(JSON.stringify(blog || null));
  } catch (error) {
    console.error("Direct db fetch failed for slug:", slug, error);
    const fallback = FALLBACK_BLOGS.find(b => b.slug === slug);
    return JSON.parse(JSON.stringify(fallback || null));
  }
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: 'Post Not Found | SS Realty' };
  
  // Custom SEO parameters with rich defaults
  const seoTitle = blog.seo?.title || blog.title;
  const seoDesc = blog.seo?.description || blog.excerpt;
  const seoKeywords = blog.seo?.keywords || blog.tags?.join(', ') || '';
  const canonicalUrl = blog.seo?.canonicalUrl || `https://ssrealty.com/blog/${slug}`;

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: `https://ssrealty.in/blog/${slug}`,
      type: 'article',
      images: [{ url: blog.coverImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [blog.coverImage],
    }
  };
}

import BlogLeadForm from '@/components/blog/BlogLeadForm';
import { CheckCircle } from 'lucide-react';

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  const readingTime = Math.ceil((blog.content || '').split(' ').length / 200);

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    image: blog.coverImage,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'SS Realty Expert',
      url: 'https://ssrealty.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SS Realty',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ssrealty.in/SS%20Realty%20Official%20Logo.png',
      },
    },
    description: blog.excerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ssrealty.in/blog/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Premium Hero Section with Lead Form */}
      <div className="relative pt-22 pb-4 lg:pt-26 lg:pb-8 overflow-hidden border-b border-[#E8D5A3]/40">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#C9A227 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#C9A227]/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-16 items-start">
            
            {/* 1. Header (Title + Excerpt) */}
            <div className="animate-fade-in-up order-1 lg:col-start-1 lg:row-start-1">
              <Link href="/blog" className="inline-flex items-center gap-2 text-[#C9A227] hover:text-[#B8860B] font-semibold text-[10px] mb-4 uppercase tracking-wider group">
                <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" /> Back to Blog
              </Link>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-[#C9A227]/10 text-[#B8860B] rounded-md text-[9px] font-bold uppercase tracking-wide">
                  {blog.category}
                </span>
                <span className="w-1 h-1 bg-[#a09060] rounded-full" />
                <span className="text-[10px] text-[#a09060] font-medium">{readingTime} min read</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-4 leading-[1.2]">
                {blog.title}
              </h1>
              
              <p className="text-[#6b6450] text-sm md:text-base mb-3 leading-relaxed max-w-xl">
                {blog.excerpt}
              </p>
            </div>

            {/* 2. Lead Form (Mobile: Middle, Desktop: Right) */}
            <div className="relative animate-scale-in lg:max-w-md ml-auto w-full order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <div className="absolute inset-0 -m-2 bg-white/40 blur-lg rounded-3xl" />
              <BlogLeadForm />
            </div>

            {/* 3. Why Section (Mobile: Bottom, Desktop: Below Header) */}
            <div className="order-3 lg:col-start-1 lg:row-start-2 mt-1 lg:mt-1">
              <div className="mb-4">
                <h3 className="text-[14px] font-black text-[#1A1800] mb-2 uppercase tracking-[0.1em]">Why get property on <span className="text-[#C9A227]">SS Realty?</span></h3>
                <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                  {[
                    'Verified Luxury Properties',
                    'Market Insights & Pricing',
                    'Expert Consultation'
                  ].map((hook, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white border border-[#E8D5A3]/30 py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all group/hook whitespace-nowrap">
                      <div className="flex-shrink-0 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="text-white" size={9} strokeWidth={3} />
                      </div>
                      <span className="text-[10px] font-bold text-[#3a3828]">{hook}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author & Trust Stats (Single Row Consolidation) */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-5 border-t border-[#E8D5A3]/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A227]/20 flex items-center justify-center font-bold text-[#C9A227] text-xs">
                    SS
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#1A1800] leading-none mb-1">{blog.author?.name || 'SS Realty Expert'}</p>
                    <p className="text-[9px] text-[#a09060] leading-none">{formatDate(blog.createdAt)}</p>
                  </div>
                </div>

                {/* Horizontal Trust Stats */}
                <div className="flex items-center gap-4 sm:gap-8">
                  {[
                    { label: 'Investors', val: '1,200+' },
                    { label: 'Years', val: '10+' },
                    { label: 'Listings', val: '500+' }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center sm:flex-row sm:gap-1.5">
                      <span className="text-[12px] font-black text-[#1A1800] leading-none">{stat.val}</span>
                      <span className="text-[8px] text-[#a09060] font-bold uppercase tracking-tight">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* ── THUMBNAIL (16:9 = 1920×1080 ratio) ── */}
            {blog.coverImage && (
              <div className="relative w-full mb-8 rounded-2xl overflow-hidden shadow-lg"
                style={{ aspectRatio: '16 / 9' }}
              >
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                  priority
                />
              </div>
            )}

            <p className="text-lg text-[#504e40] leading-relaxed italic border-l-4 border-[#C9A227] pl-5 mb-8 bg-[#FFFBEB] py-4 pr-4 rounded-r-xl">
              {blog.excerpt}
            </p>

            <div 
              className="prose prose-lg max-w-none text-[#3a3828] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[#E8D5A3]">
                {blog.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-[#C9A227]/10 text-[#B8860B] rounded-full text-xs font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar / Related Posts */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <div className="bg-white rounded-2xl border border-[#E8D5A3] p-6">
                <h3 className="text-xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-5 pb-3 border-b border-[#E8D5A3]">
                  Related <span className="text-[#C9A227]">Articles</span>
                </h3>
                <div className="space-y-6">
                  {/* We show fallback related posts for better UX if dynamic is missing */}
                  {[
                    { title: 'NRI Guide to Buying Property', slug: 'nri-guide-buying-property-india', date: '2026-04-25' },
                    { title: 'Luxury Living in Gwal Pahari', slug: 'luxury-living-gurugram-gwal-pahari', date: '2026-04-22' },
                    { title: 'Noida Expressway Commercial Boom', slug: 'noida-expressway-commercial-real-estate-boom', date: '2026-04-15' }
                  ].filter(p => p.slug !== slug).slice(0, 2).map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                      <p className="text-xs text-[#a09060] mb-1">{formatDate(post.date)}</p>
                      <h4 className="font-semibold text-[#1A1800] group-hover:text-[#C9A227] transition-colors leading-snug">
                        {post.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter / CTA Sidebar */}
              <div className="gold-gradient rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold text-[#1A1800] mb-2">Get Market Updates</h3>
                <p className="text-[#5c4004] text-xs mb-5">Subscribe to our newsletter for exclusive insights.</p>
                <div className="space-y-2">
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-2 rounded-xl border border-[#E8D5A3] text-sm outline-none focus:border-[#C9A227]" />
                  <button className="w-full bg-[#1A1800] text-[#C9A227] font-semibold py-2 rounded-xl text-sm transition-transform active:scale-95">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-[#1A1800] rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #C9A227 0%, transparent 60%)' }} />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-bold font-[var(--font-playfair)] text-white mb-4">
              Looking for the <span className="text-[#C9A227]">Perfect Property?</span>
            </h3>
            <p className="text-[#a09060] text-base mb-8 max-w-2xl mx-auto">Our experts are ready to help you find your dream home or investment in Delhi NCR.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/properties" className="bg-[#C9A227] text-[#1A1800] font-bold px-10 py-4 rounded-xl hover:bg-white hover:text-[#1A1800] transition-all transform hover:-translate-y-1">
                Browse Properties
              </Link>
              <Link href="/contact" className="bg-transparent text-white border border-white/30 font-bold px-10 py-4 rounded-xl hover:bg-white/10 transition-all">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
