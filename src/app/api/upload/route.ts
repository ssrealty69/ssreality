import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types — validated server-side (not just client-side)
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/heic',   // iPhone photos
  'image/heif',
  'application/pdf', // Allowed for brochures
];

// Folder → Cloudinary transformation preset mapping
const FOLDER_PRESET_MAP: Record<string, 'property' | 'blog' | 'thumbnail'> = {
  'ss-realty/properties': 'property',
  'ss-realty/blog':       'blog',
  'ss-realty/thumbnails': 'thumbnail',
  'ss-realty':            'property', // default
};

// Allowed upload folders — prevent directory traversal attacks
const ALLOWED_FOLDERS = new Set(Object.keys(FOLDER_PRESET_MAP));

export async function POST(req: NextRequest) {
  try {
    // ── Auth check: only ADMIN_SECRET or valid admin cookie are accepted ─────
    // FIXED: Previously `secret !== 'authenticated'` let anyone bypass by
    // sending `x-admin-secret: authenticated`. Now we only accept ADMIN_SECRET.
    const secret = req.headers.get('x-admin-secret');
    const cookieToken = req.cookies.get('admin_token')?.value;
    const adminSecret = process.env.ADMIN_SECRET;

    const isAuthorized =
      (secret && adminSecret && secret === adminSecret) ||
      cookieToken === 'authenticated';

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const rawFolder = (formData.get('folder') as string) || 'ss-realty';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // ── Folder whitelist — prevent path traversal ─────────────────────────
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : 'ss-realty';

    // ── File size validation ──────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum allowed size is 50MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      );
    }

    // ── File type validation (MIME type from file object) ─────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF, HEIC, PDF` },
        { status: 400 }
      );
    }

    // ── Convert file → base64 ─────────────────────────────────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // ── Pick the right optimization preset ───────────────────────────────
    const preset = FOLDER_PRESET_MAP[folder] || 'property';
    const isPdf = file.type === 'application/pdf';

    // ── Upload to Cloudinary with auto-optimization ───────────────────────
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'image',
      unique_filename: true,
      use_filename: false,
      ...(!isPdf && preset === 'property' && {
        transformation: [
          { width: 1920, height: 1280, crop: 'limit' },
          { quality: 'auto:best', fetch_format: 'auto' },
          { flags: 'progressive' },
        ],
      }),
      ...(!isPdf && preset === 'blog' && {
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' },
          { flags: 'progressive' },
        ],
      }),
      ...(!isPdf && preset === 'thumbnail' && {
        transformation: [
          { width: 400, height: 300, crop: 'fill', gravity: 'auto' },
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
      }),
    });

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
    // Do not leak internal error details in production
    const safeMsg = process.env.NODE_ENV === 'production' ? 'Upload failed' : msg;
    return NextResponse.json({ success: false, error: safeMsg }, { status: 500 });
  }
}
