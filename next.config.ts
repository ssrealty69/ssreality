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
    // NOTE: lucide-react intentionally excluded from optimizePackageImports.
    // When enabled, Turbopack splits each icon into its own .mjs chunk (e.g. target.mjs).
    // If any icon import is removed from code, the browser's cached chunk manifest
    // references a chunk that no longer exists → "module factory is not available" error.
    // Keeping it out bundles all used icons into a single stable chunk.
    optimizePackageImports: ['react-hot-toast', 'framer-motion'],
    // Allow large file uploads up to 50MB for property/blog image uploads
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // ─── HTTP Security Headers ────────────────────────────────────────────────
  async headers() {
    return [
      // ── Comprehensive security headers for all routes ─────────────────────
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // DNS prefetch control
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Force HTTPS for 1 year (HSTS) — only applies in production
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Restrict browser feature access
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()',
            ].join(', '),
          },
          // Content Security Policy — blocks XSS, injection, and unauthorized resources
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + Vercel analytics + Google tag manager + inline (needed for Next.js)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
              // Styles: self + Google Fonts + inline (needed for Next.js)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self + Cloudinary + Unsplash + Pixabay + YouTube + data URIs
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://images.unsplash.com https://cdn.pixabay.com https://img.youtube.com https://www.google-analytics.com",
              // Connections: self + API calls + Google Analytics
              "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com https://vercel.live wss://ws-us3.pusher.com",
              // Frames: YouTube and Google Maps embeds allowed
              "frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com https://maps.google.com",
              // Media: self only
              "media-src 'self' https://res.cloudinary.com",
              // Objects: local PDF viewing allowed
              "object-src 'self'",
              // Base URI restricted to self
              "base-uri 'self'",
              // Form actions: self only
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      // ── Aggressive caching for static assets ──────────────────────────────
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico|woff|woff2|ttf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
