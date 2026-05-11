import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/heic',   // iPhone photos
  'image/heif',
];

// Folder → Cloudinary transformation preset mapping
const FOLDER_PRESET_MAP: Record<string, 'property' | 'blog' | 'thumbnail'> = {
  'ss-realty/properties': 'property',
  'ss-realty/blog':       'blog',
  'ss-realty/thumbnails': 'thumbnail',
  'ss-realty':            'property', // default
};

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'ss-realty';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // ── File size validation ──────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum allowed size is 50MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      );
    }

    // ── File type validation ──────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF, HEIC` },
        { status: 400 }
      );
    }

    // ── Convert file → base64 ─────────────────────────────────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // ── Pick the right optimization preset ───────────────────────────────
    const preset = FOLDER_PRESET_MAP[folder] || 'property';

    // ── Upload to Cloudinary with auto-optimization ───────────────────────
    // Cloudinary handles: resize → convert to WebP/AVIF → compress → CDN cache
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'image',
      unique_filename: true,
      use_filename: false,
      // Auto-optimization transformations based on folder type
      ...(preset === 'property' && {
        transformation: [
          { width: 1920, height: 1280, crop: 'limit' },
          { quality: 'auto:best', fetch_format: 'auto' },
          { flags: 'progressive' },
        ],
      }),
      ...(preset === 'blog' && {
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' },
          { flags: 'progressive' },
        ],
      }),
      ...(preset === 'thumbnail' && {
        transformation: [
          { width: 400, height: 300, crop: 'fill', gravity: 'auto' },
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
      }),
    });

    // Return useful metadata to the frontend
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      originalSizeKB: Math.round(file.size / 1024),
      optimisedSizeKB: Math.round(result.bytes / 1024),
      savedPercent: Math.round((1 - result.bytes / file.size) * 100),
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Upload failed';
    console.error('[Upload API Error]', error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
