import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ─── Image Optimization ───────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],          // Serve AVIF first, then WebP
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,                      // Cache images for 1 year
    qualities: [70, 75, 80, 85, 90, 100],           // Optimized quality — saves ~30% vs 85
    dangerouslyAllowSVG: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: '**.giphy.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },        // YouTube thumbnails
    ],
  },

  // ─── Build Optimizations ─────────────────────────────────────────────────
  compress: true,                                   // Enable gzip compression
  poweredByHeader: false,                           // Remove X-Powered-By header
  reactStrictMode: true,

  // ─── Experimental ────────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast', 'framer-motion'],
    // Allow large file uploads up to 50MB for property/blog image uploads
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // ─── HTTP Headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      // Security headers for all routes
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      // Aggressive caching for static assets (images, fonts, JS, CSS)
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico|woff|woff2|ttf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache Next.js static chunks
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
