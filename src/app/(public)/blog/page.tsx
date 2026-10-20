import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { Blog } from '@/types';
import { getAllBlogs } from '@/lib/blog-service';
import BlogListClient from '@/components/blog/BlogListClient';

export const metadata: Metadata = {
  title: 'Real Estate Blog | Delhi NCR Market Insights | SS Realty',
  description:
    'Expert real estate guides, property investment tips & Delhi NCR market trends. Stay informed with SS Realty\'s blog for buyers, sellers & NRI investors.',
  alternates: { canonical: 'https://ssrealty.org/blog' },
  openGraph: {
    title: 'Real Estate Blog & Delhi NCR Property Guides | SS Realty',
    description: 'Expert property investment guides, registry flat advice, and market insights for Chattarpur, Gwal Pahari, and Gurgaon.',
    url: 'https://ssrealty.org/blog',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SS Realty Blog & Market Insights' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delhi NCR Real Estate Blog | SS Realty',
    description: 'Property guides, market trends and investment tips in Delhi NCR.',
    images: ['/og-image.jpg'],
  },
};

// Static + ISR: category filtering happens client-side via /api/blog (Redis cached),
// so this page must not read searchParams (that would force a function run per visit).
export const revalidate = 1800;

async function getInitialBlogs(category?: string): Promise<{ data: Blog[], total: number }> {
  try {
    const { data, total } = await getAllBlogs(category, 9, 1);
    return {
      data: JSON.parse(JSON.stringify(data || [])),
      total: total || 0,
    };
  } catch (error) {
    console.error("Direct service fetch for blogs failed:", error);
    return { data: [], total: 0 };
  }
}

const CATEGORIES = ['All', 'Market Trends', 'Investment', 'Legal', 'Home Tips', 'NRI'];

async function BlogPageContent({ currentCategory }: { currentCategory: string }) {
  const { data: initialBlogs, total: initialTotal } = await getInitialBlogs(currentCategory);

  return (
    <BlogListClient
      initialBlogs={initialBlogs}
      initialTotal={initialTotal}
      initialCategory={currentCategory}
      categories={CATEGORIES}
    />
  );
}

export default async function BlogPage() {
  const currentCategory = 'All';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ssrealty.org' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://ssrealty.org/blog' },
    ],
  };

  const blogCollectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'SS Realty Blog & Insights',
    description: 'Real estate news, market trends, investment tips, and property buying guides in Delhi NCR.',
    url: 'https://ssrealty.org/blog',
    publisher: {
      '@type': 'Organization',
      name: 'SS Realty',
      url: 'https://ssrealty.org',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ssrealty.org/SS%20Realty%20Official%20Logo.png',
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionSchema) }}
      />
      {/* Header */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/90 via-[#1A1800]/85 to-[#1A1800]/75" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFEF5] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="gold-divider mb-5" />
          <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] mb-4 text-white">
            <span className="text-white">Blog &</span> <span className="text-[#C9A227]">Insights</span>
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
