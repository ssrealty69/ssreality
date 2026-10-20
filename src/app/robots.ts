import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.org';

  const disallowList = ['/api/', '/admin/', '/floor-plans/', '/floorview'];

  return {
    rules: [
      // Default: allow all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowList,
      },
      // ── Google AI & Search Crawlers ──────────────────────────────────────
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'Google-Extended', // Gemini / Google AI training
        allow: '/',
        disallow: disallowList,
      },
      // ── OpenAI / ChatGPT Crawlers ────────────────────────────────────────
      {
        userAgent: 'GPTBot',           // ChatGPT training crawler
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'OAI-SearchBot',    // ChatGPT real-time search
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'ChatGPT-User',     // ChatGPT browsing plugin
        allow: '/',
        disallow: disallowList,
      },
      // ── Anthropic / Claude Crawlers ──────────────────────────────────────
      {
        userAgent: 'ClaudeBot',        // Claude AI crawler
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'Anthropic-ai',
        allow: '/',
        disallow: disallowList,
      },
      // ── Perplexity AI Crawlers ───────────────────────────────────────────
      {
        userAgent: 'PerplexityBot',    // Perplexity.ai search
        allow: '/',
        disallow: disallowList,
      },
      // ── xAI / Grok Crawlers ──────────────────────────────────────────────
      {
        userAgent: 'xAI',              // Grok by xAI
        allow: '/',
        disallow: disallowList,
      },
      // ── Microsoft / Bing AI / Copilot ────────────────────────────────────
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'msnbot',
        allow: '/',
        disallow: disallowList,
      },
      // ── Meta AI Crawlers ─────────────────────────────────────────────────
      {
        userAgent: 'FacebookBot',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'Meta-ExternalAgent', // Meta AI crawling
        allow: '/',
        disallow: disallowList,
      },
      // ── Apple Intelligence & Siri ────────────────────────────────────────
      {
        userAgent: 'Applebot',          // Apple Search & Spotlight
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'Applebot-Extended', // Apple Intelligence AI training & search
        allow: '/',
        disallow: disallowList,
      },
      // ── Amazon Alexa & Cloud Crawlers ────────────────────────────────────
      {
        userAgent: 'Amazonbot',
        allow: '/',
        disallow: disallowList,
      },
      // ── Cohere / ByteDance / Other AI Research Crawlers ──────────────────
      {
        userAgent: 'Bytespider',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'Omgilibot',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'YouBot',           // You.com AI search
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'DuckAssistBot',    // DuckDuckGo AI
        allow: '/',
        disallow: disallowList,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
