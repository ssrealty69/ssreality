import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSeoLandingPage, SEO_LANDING_PAGES } from '@/lib/seo-landing-pages';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyModel from '@/models/Property';
import { connectDB } from '@/lib/mongodb';
import type { Property } from '@/types';
import { CheckCircle2, Phone, MessageSquare, MapPin, ArrowRight, ShieldCheck, Banknote, Sparkles, Building2 } from 'lucide-react';

interface SeoLandingPageProps {
  params: Promise<{ seoSlug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(SEO_LANDING_PAGES).map((slug) => ({
    seoSlug: slug,
  }));
}

export async function generateMetadata({ params }: SeoLandingPageProps): Promise<Metadata> {
  const { seoSlug } = await params;
  const config = getSeoLandingPage(seoSlug);

  if (!config) {
    return {};
  }

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: {
      canonical: config.canonicalUrl,
    },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: config.canonicalUrl,
      type: 'website',
      siteName: 'SS Realty',
    },
  };
}

async function getMatchingProperties(filters: { location?: string; bedrooms?: number; propertyType?: string }): Promise<Property[]> {
  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (filters.location) {
      query.$or = [
        { 'location.city': { $regex: filters.location, $options: 'i' } },
        { 'location.address': { $regex: filters.location, $options: 'i' } },
        { title: { $regex: filters.location, $options: 'i' } },
        { description: { $regex: filters.location, $options: 'i' } }
      ];
    }

    if (filters.bedrooms) {
      query.bedrooms = filters.bedrooms;
    }

    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }

    const properties = await PropertyModel.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(12)
      .lean();

    return JSON.parse(JSON.stringify(properties));
  } catch (error) {
    console.error('Failed to fetch properties for SEO landing page:', error);
    return [];
  }
}

export default async function SeoLandingPage({ params }: SeoLandingPageProps) {
  const { seoSlug } = await params;
  const config = getSeoLandingPage(seoSlug);

  if (!config) {
    notFound();
  }

  const properties = await getMatchingProperties(config.filters);

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* Hero Banner */}
      <div className="relative pt-36 pb-20 overflow-hidden bg-[#1A1800]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1800] via-[#1A1800]/80 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#F0D060] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} className="text-[#C9A227]" />
            <span>Verified Builder Floors • 0% Brokerage</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-[var(--font-playfair)] font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
            {config.h1}
          </h1>

          <p className="text-base sm:text-xl text-[#d4c490] max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            {config.subheading}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+919311059100"
              className="px-7 py-3.5 rounded-full bg-[#C9A227] text-[#1A1800] font-bold text-sm hover:bg-[#B8860B] transition-all shadow-lg shadow-[#C9A227]/20 flex items-center gap-2"
            >
              <Phone size={16} />
              <span>Call Developer Directly</span>
            </a>
            <a
              href="https://wa.me/919311059100"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-full bg-[#25D366] text-white font-bold text-sm hover:bg-[#1EBE5D] transition-all shadow-lg shadow-[#25D366]/20 flex items-center gap-2"
            >
              <MessageSquare size={16} />
              <span>WhatsApp Instant Inquiry</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Features Highlights Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-[#E8D5A3]/60 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 flex items-center justify-center text-[#C9A227] shrink-0 mt-0.5">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-sm font-semibold text-[#1A1800] leading-snug">{feature}</p>
            </div>
          ))}
        </div>

        {/* Matching Properties Section */}
        <div className="space-y-8">
          <div className="flex items-end justify-between flex-wrap gap-4 border-b border-[#E8D5A3]/50 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-playfair)] text-[#1A1800]">
                Available Properties ({properties.length})
              </h2>
              <p className="text-sm text-[#a09060] mt-1">
                Explore handpicked verified builder floors matching "{config.h1}"
              </p>
            </div>
            <Link
              href="/properties"
              className="text-xs font-bold text-[#C9A227] uppercase tracking-wider hover:text-[#B8860B] flex items-center gap-1.5"
            >
              <span>View All Properties</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E8D5A3]">
              <Building2 className="mx-auto text-[#C9A227] mb-3" size={40} />
              <p className="text-xl font-bold text-[#1A1800] mb-2">Exclusive Site Visits Available</p>
              <p className="text-sm text-[#a09060] max-w-md mx-auto mb-6">
                We have newly finished inventory in this location. Contact our team to get recent photos, floor plans, and site visit access.
              </p>
              <a
                href="tel:+919311059100"
                className="px-6 py-2.5 bg-[#C9A227] text-[#1A1800] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#B8860B] inline-flex items-center gap-2"
              >
                <Phone size={14} />
                <span>Call +91 93110 59100</span>
              </a>
            </div>
          )}
        </div>

        {/* Detailed SEO Information Article */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8D5A3]/60 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold font-[var(--font-playfair)] text-[#1A1800]">
            Overview & Key Highlights
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-[#4a4535] leading-relaxed">
            {config.introParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Value Propositions */}
          <div className="pt-6 border-t border-[#E8D5A3]/40 grid sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#C9A227]" size={24} />
              <div>
                <h4 className="text-xs font-bold uppercase text-[#1A1800]">100% Registry Ready</h4>
                <p className="text-xs text-[#a09060]">Clear legal titles & deed approval</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Banknote className="text-[#C9A227]" size={24} />
              <div>
                <h4 className="text-xs font-bold uppercase text-[#1A1800]">Up to 90% Bank Loan</h4>
                <p className="text-xs text-[#a09060]">SBI, HDFC, ICICI & PNB assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-[#C9A227]" size={24} />
              <div>
                <h4 className="text-xs font-bold uppercase text-[#1A1800]">Prime Connectivity</h4>
                <p className="text-xs text-[#a09060]">Minutes to Metro & Cyber City</p>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ) */}
        {config.faqs.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-playfair)] text-[#1A1800] text-center">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {config.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#E8D5A3]/60 shadow-sm space-y-2">
                  <h3 className="text-base font-bold text-[#1A1800] flex items-start gap-2">
                    <span className="text-[#C9A227] font-black">Q.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-sm text-[#5c5540] pl-5 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
