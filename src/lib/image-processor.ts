/**
 * image-processor.ts
 * Server-side image & PDF optimization using sharp.
 * Called by /api/upload before Cloudinary upload to guarantee:
 *  - All images are stored as WebP (not PNG/JPG/HEIC/etc.)
 *  - Images are resized to sensible max dimensions
 *  - PDFs are left for Cloudinary to handle (raw resource type)
 */



// ─── Config ────────────────────────────────────────────────────────────────

const PRESET_CONFIG = {
  /** Property listing images — high quality, max 1920px */
  property: {
    maxWidth:  1920,
    maxHeight: 1280,
    quality:   82,
  },
  /** Blog cover / article images */
  blog: {
    maxWidth:  1200,
    maxHeight: 800,
    quality:   80,
  },
  /** Small thumbnails */
  thumbnail: {
    maxWidth:  600,
    maxHeight: 450,
    quality:   75,
  },
  /** Default fallback */
  default: {
    maxWidth:  1920,
    maxHeight: 1280,
    quality:   82,
  },
} as const;

export type ImagePreset = keyof typeof PRESET_CONFIG;
