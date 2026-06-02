import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.in';
  
  const disallowList = ['/api/', '/admin/', '/floor-plans/', '/floorview'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowList,
      },
      // AI Crawlers ko specially allow (but keep admin/private pages strictly blocked)
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Anthropic-ai', 'Claude-Web', 'ChatGPT-User', 'OmgiliBot'],
        allow: '/',
        disallow: disallowList,
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
