import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// ─── Upload Presets ────────────────────────────────────────────────────────
// Each preset auto-optimises the image for its use case on Cloudinary servers
const UPLOAD_PRESETS = {
  property: {
    // Property listing images: max 1920px, WebP/AVIF, smart quality
    transformation: [
      { width: 1920, height: 1280, crop: 'limit' as const },
      { quality: 'auto:best', fetch_format: 'auto' },
      { flags: 'progressive' as const },
    ],
  },
  blog: {
    // Blog cover images: max 1200px wide, optimized for web reading
    transformation: [
      { width: 1200, height: 800, crop: 'limit' as const },
      { quality: 'auto:good', fetch_format: 'auto' },
      { flags: 'progressive' as const },
    ],
  },
  thumbnail: {
    // Thumbnails: exact size, smart face/content crop
    transformation: [
      { width: 400, height: 300, crop: 'fill' as const, gravity: 'auto' as const },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  },
} as const;

// ─── Main Upload Function ──────────────────────────────────────────────────
export async function uploadImage(
  file: string,
  folder: string = 'ss-realty',
  preset: keyof typeof UPLOAD_PRESETS = 'property'
): Promise<string> {
  const config = UPLOAD_PRESETS[preset];
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    transformation: config.transformation as any,
    unique_filename: true,
    use_filename: false,
  });
  return result.secure_url;
}

// ─── Upload with full result (returns url, publicId, dimensions) ──────────
export async function uploadImageFull(
  file: string,
  folder: string = 'ss-realty',
  preset: keyof typeof UPLOAD_PRESETS = 'property'
) {
  const config = UPLOAD_PRESETS[preset];
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    transformation: config.transformation as any,
    unique_filename: true,
    use_filename: false,
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

// ─── Delete Image ─────────────────────────────────────────────────────────
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// ─── Get Optimized URL (runtime transformations for display) ──────────────
// Pass any Cloudinary URL and get a resized/optimized version on the fly
export function getOptimizedUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number | string } = {}
): string {
  if (!url.includes('cloudinary')) return url;
  const { width, height, quality = 'auto:good' } = options;
  const parts = [
    `q_${quality}`,
    'f_auto',
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
    width || height ? 'c_fill,g_auto' : '',
    'fl_progressive',
  ].filter(Boolean).join(',');
  return url.replace('/upload/', `/upload/${parts}/`);
}
