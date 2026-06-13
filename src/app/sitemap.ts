import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import Blog from '@/models/Blog';
import { Question } from '@/models/Question';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.org';

  // Yahan apne dynamic pages add kar sakte ho (database se bhi fetch kar sakte ho)
  const staticPages: MetadataRoute.Sitemap = [
    '', '/properties', '/about', '/contact-us', '/blog', '/ask-anything', '/emi-calculator', '/privacy', '/terms', '/careers'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    await connectDB();
    
    // Fetch properties
    const properties = await Property.find({ status: { $ne: 'sold' } })
      .select('_id updatedAt createdAt')
      .lean();
    
    const propertyPages: MetadataRoute.Sitemap = properties.map((property: any) => ({
      url: `${baseUrl}/properties/${property._id}`,
      lastModified: property.updatedAt || property.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Fetch published blogs
    const blogs = await Blog.find({ 
      $or: [
        { published: true }, // Legacy
        { status: 'published' },
        { status: 'scheduled', publishDate: { $lte: new Date() } }
      ]
    })
      .select('slug updatedAt createdAt')
      .lean();
    
    const blogPages: MetadataRoute.Sitemap = blogs.map((blog: any) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt || blog.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Fetch published QA questions
    const questions = await Question.find({ status: 'published' }).select('slug updatedAt createdAt').lean();
    
    const qaPages: MetadataRoute.Sitemap = questions.map((q: any) => ({
      url: `${baseUrl}/ask-anything/${q.slug}`,
      lastModified: q.updatedAt || q.createdAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    return [...staticPages, ...propertyPages, ...blogPages, ...qaPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages as fallback
    return staticPages;
  }
}
