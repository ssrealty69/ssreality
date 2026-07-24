import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import Blog from '@/models/Blog';
import { SEO_LANDING_PAGES } from '@/lib/seo-landing-pages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.org';

  // 1. Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    { route: '',              priority: 1.0 },
    { route: '/properties',   priority: 0.9 },
    { route: '/about-us',     priority: 0.8 },
    { route: '/contact-us',   priority: 0.8 },
    { route: '/blog',         priority: 0.8 },
    { route: '/emi-calculator', priority: 0.7 },
    { route: '/careers',      priority: 0.6 },
    { route: '/privacy',      priority: 0.4 },
    { route: '/terms',        priority: 0.4 },
  ].map(({ route, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }));

  // 2. High-priority dedicated SEO landing pages
  const seoLandingPages: MetadataRoute.Sitemap = Object.keys(SEO_LANDING_PAGES).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.95,
  }));

  try {
    await connectDB();
    
    // 3. Fetch properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties = await Property.find({ status: { $ne: 'sold' } })
      .select('_id slug updatedAt createdAt')
      .lean();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propertyPages: MetadataRoute.Sitemap = properties.map((property: any) => ({
      url: `${baseUrl}/properties/${property.slug || property._id}`,
      lastModified: property.updatedAt || property.createdAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // 4. Fetch published blogs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blogs = await Blog.find({ 
      $or: [
        { published: true },
        { status: 'published' },
        { status: 'scheduled', publishDate: { $lte: new Date() } }
      ]
    })
      .select('slug updatedAt createdAt')
      .lean();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blogPages: MetadataRoute.Sitemap = blogs.map((blog: any) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt || blog.createdAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...seoLandingPages, ...propertyPages, ...blogPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [...staticPages, ...seoLandingPages];
  }
}
