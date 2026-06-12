/**
 * image-processor.ts
 * Server-side image & PDF optimization using sharp.
 * Called by /api/upload before Cloudinary upload to guarantee:
 *  - All images are stored as WebP (not PNG/JPG/HEIC/etc.)
 *  - Images are resized to sensible max dimensions
 *  - PDFs are left for Cloudinary to handle (raw resource type)
 */

import sharp from 'sharp';

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

// ─── Result shape ──────────────────────────────────────────────────────────

export interface ProcessedImage {
  /** WebP buffer ready to upload */
  buffer: Buffer;
  /** Always 'webp' */
  format: 'webp';
  /** Width of converted image */
  width: number;
  /** Height of converted image */
  height: number;
  /** Converted size in bytes */
  sizeBytes: number;
}

// ─── Main conversion function ──────────────────────────────────────────────

/**
 * Convert ANY image format to WebP with sensible max dimensions.
 * Handles: JPEG, PNG, GIF, HEIC, AVIF, TIFF, BMP, WEBP (re-optimised)
 *
 * @param inputBuffer  Raw file bytes
 * @param preset       Size/quality preset name
 */
export async function convertToWebP(
  inputBuffer: Buffer,
  preset: ImagePreset = 'property'
): Promise<ProcessedImage> {
  const cfg = PRESET_CONFIG[preset] ?? PRESET_CONFIG.default;

  const pipeline = sharp(inputBuffer, {
    // Limit input pixels to prevent zip-bomb / large GIF attacks
    limitInputPixels: 268_402_689, // ~16384×16384
    // Auto-rotate based on EXIF orientation (common in phone photos)
    failOn: 'warning',
  })
    .rotate()                           // Auto-rotate from EXIF
    .resize(cfg.maxWidth, cfg.maxHeight, {
      fit: 'inside',                    // Never upscale, only downscale
      withoutEnlargement: true,
    })
    .webp({
      quality: cfg.quality,
      effort: 4,                        // 0(fast)…6(slow); 4 is a good balance
      smartSubsample: true,
      nearLossless: false,
    });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer:    data,
    format:    'webp',
    width:     info.width,
    height:    info.height,
    sizeBytes: info.size,
  };
}

/**
 * Quick metadata read — used for validation before conversion.
 */
export async function readImageMeta(buffer: Buffer) {
  try {
    const meta = await sharp(buffer).metadata();
    return {
      width:  meta.width  ?? 0,
      height: meta.height ?? 0,
      format: meta.format ?? 'unknown',
    };
  } catch {
    return null;
  }
}
