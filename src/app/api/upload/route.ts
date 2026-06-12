import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { type ImagePreset } from '@/lib/image-processor';

// ─── Critical: Force this route to always be server-rendered, NEVER cached ──
// Without this, Vercel CDN can cache even error responses as static pages.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── No-cache helper ──────────────────────────────────────────────────────
/** All API responses must never be cached by Vercel CDN or browsers */
function noCache(body: object, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Surrogate-Control': 'no-store',
    },
  });
}

// ─── Constants ────────────────────────────────────────────────────────────

/** Max raw upload size the server will accept (before conversion) */
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/** MIME types accepted for image uploads */
const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
]);

/** Folder → sharp preset mapping */
const FOLDER_PRESET_MAP: Record<string, ImagePreset> = {
  'ss-realty/properties': 'property',
  'ss-realty/blog':       'blog',
  'ss-realty/thumbnails': 'thumbnail',
  'ss-realty':            'property',
};

const ALLOWED_FOLDERS = new Set(Object.keys(FOLDER_PRESET_MAP));

// ─── Route handler ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────
    const secret      = req.headers.get('x-admin-secret');
    const cookieToken = req.cookies.get('admin_token')?.value;
    const adminSecret = process.env.ADMIN_SECRET;

    console.log('[Upload] Auth check — cookie:', cookieToken ? 'present' : 'missing', '| secret header:', secret ? 'present' : 'missing', '| ADMIN_SECRET set:', !!adminSecret);

    const isAuthorized =
      (secret && adminSecret && secret === adminSecret) ||
      cookieToken === 'authenticated';

    if (!isAuthorized) {
      console.warn('[Upload] Unauthorized request');
      return noCache({ success: false, error: 'Unauthorized' }, 401);
    }

    // ── Parse form ──────────────────────────────────────────────────────
    console.log('[Upload] Parsing formData...');
    const formData = await req.formData();
    const file      = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string) || 'ss-realty';

    console.log('[Upload] File:', file ? `${file.name} (${file.type}, ${file.size} bytes)` : 'MISSING', '| Folder:', rawFolder);

    if (!file) {
      return noCache({ success: false, error: 'No file provided' }, 400);
    }

    // ── Folder whitelist ────────────────────────────────────────────────
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : 'ss-realty';
    const preset = FOLDER_PRESET_MAP[folder] ?? 'property';

    // ── File-size guard ─────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return noCache(
        { success: false, error: `File too large. Max 50 MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)} MB` },
        400
      );
    }

    // ── Type check ──────────────────────────────────────────────────────
    const isPdf = file.type === 'application/pdf';
    const isImage = IMAGE_TYPES.has(file.type);

    if (!isImage && !isPdf) {
      return noCache(
        { success: false, error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF, HEIC, BMP, TIFF, PDF` },
        400
      );
    }

    // ── Read bytes ──────────────────────────────────────────────────────
    console.log('[Upload] Reading file bytes...');
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalSizeKB = Math.round(file.size / 1024);

    // ════════════════════════════════════════════════════════════════════
    // BRANCH A — IMAGE: Upload to Cloudinary (Cloudinary handles resize+WebP)
    // Sharp is bypassed to prevent Vercel Serverless OOM crashes.
    // ════════════════════════════════════════════════════════════════════
    if (isImage) {
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

      // Set Cloudinary transformation limits based on preset
      let maxWidth = 1920;
      let maxHeight = 1280;
      if (preset === 'blog') {
        maxWidth = 1200;
        maxHeight = 800;
      } else if (preset === 'thumbnail') {
        maxWidth = 600;
        maxHeight = 450;
      }

      console.log('[Upload] Uploading image to Cloudinary — folder:', folder, '| maxWidth:', maxWidth);

      // Verify Cloudinary config is present
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey    = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      if (!cloudName || !apiKey || !apiSecret) {
        console.error('[Upload] MISSING Cloudinary env vars! cloud_name:', cloudName, '| api_key:', !!apiKey, '| api_secret:', !!apiSecret);
        return noCache({ success: false, error: 'Server configuration error: Cloudinary credentials missing' }, 500);
      }

      const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: 'image',
        unique_filename: true,
        use_filename: false,
        format: 'webp',
        transformation: [
          { width: maxWidth, height: maxHeight, crop: 'limit' },
          { quality: 'auto:best' },
        ],
      });

      console.log('[Upload] Image uploaded successfully — url:', result.secure_url);

      const finalSizeKB  = Math.round(result.bytes / 1024);
      const savedPercent = Math.round((1 - result.bytes / file.size) * 100);

      return noCache({
        success:        true,
        url:            result.secure_url,
        publicId:       result.public_id,
        format:         'webp',
        width:          result.width,
        height:         result.height,
        originalSizeKB,
        convertedSizeKB:   finalSizeKB,
        optimisedSizeKB:   finalSizeKB,
        savedPercent:      Math.max(0, savedPercent),
        message: `Converted & optimised by Cloudinary. Saved ${Math.max(0, savedPercent)}% (${originalSizeKB} KB → ${finalSizeKB} KB)`,
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // BRANCH B — PDF: Upload as raw resource
    // ════════════════════════════════════════════════════════════════════
    console.log('[Upload] Uploading PDF to Cloudinary — folder:', folder);
    const pdfBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;

    const pdfResult = await cloudinary.uploader.upload(pdfBase64, {
      folder,
      resource_type: 'raw',
      unique_filename: true,
      use_filename: false,
      eager: [{ flags: 'attachment' }],
      eager_async: false,
    });

    console.log('[Upload] PDF uploaded successfully — url:', pdfResult.secure_url);

    const pdfFinalSizeKB  = Math.round(pdfResult.bytes / 1024);
    const pdfSavedPercent = Math.round((1 - pdfResult.bytes / file.size) * 100);

    return noCache({
      success:        true,
      url:            pdfResult.secure_url,
      publicId:       pdfResult.public_id,
      format:         'pdf',
      originalSizeKB,
      optimisedSizeKB: pdfFinalSizeKB,
      savedPercent:    Math.max(0, pdfSavedPercent),
      message: `PDF uploaded & compressed. ${originalSizeKB} KB → ${pdfFinalSizeKB} KB`,
    });

  } catch (error: unknown) {
    // Always log the full error — visible in Vercel Function logs
    console.error('[Upload API Error] Full error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Upload API Error] Message:', msg);
    return noCache({ success: false, error: `Upload failed: ${msg}` }, 500);
  }
}
