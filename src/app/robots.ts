import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.in';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/floor-plans/', '/floorview'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
