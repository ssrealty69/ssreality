/**
 * Search Engine Indexing Request Helper
 * Pings Google, Bing, and IndexNow to request immediate bot crawling
 * of updated sitemap.xml and new dedicated landing pages.
 */

export async function pingSearchEngines() {
  const sitemapUrl = 'https://ssrealty.org/sitemap.xml';
  
  const pingEndpoints = [
    // Google Sitemap Indexing Ping
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    // Bing / Yahoo Sitemap Indexing Ping
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  const results = [];

  for (const url of pingEndpoints) {
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'SSRealty-Indexer/1.0' } });
      results.push({ url, status: res.status, ok: res.ok });
    } catch (err: any) {
      results.push({ url, error: err?.message || 'Failed' });
    }
  }

  return results;
}
