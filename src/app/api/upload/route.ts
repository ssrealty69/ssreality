import { NextRequest, NextResponse } from 'next/server';

// ─── Critical: Force server-rendered, never statically cached ──────────────
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── No-cache helper ──────────────────────────────────────────────────────
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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

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

const ALLOWED_FOLDERS = new Set([
  'ss-realty/properties',
  'ss-realty/blog',
  'ss-realty/thumbnails',
  'ss-realty',
]);

// ─── Route handler ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────
    const secret      = req.headers.get('x-admin-secret');
    const cookieToken = req.cookies.get('admin_token')?.value;
    const adminSecret = process.env.ADMIN_SECRET;

    console.log('[Upload] Auth — cookie:', cookieToken ? 'present' : 'missing', '| header:', secret ? 'present' : 'missing');

    const isAuthorized =
      (secret && adminSecret && secret === adminSecret) ||
      cookieToken === 'authenticated';

    if (!isAuthorized) {
      return noCache({ success: false, error: 'Unauthorized' }, 401);
    }

    // ── Verify Cloudinary env vars ──────────────────────────────────────
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('[Upload] Cloudinary config — cloud_name:', cloudName || 'MISSING', '| api_key set:', !!apiKey, '| api_secret set:', !!apiSecret);

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[Upload] FATAL: Cloudinary env vars missing on Vercel!');
      return noCache({
        success: false,
        error: 'Server configuration error: Cloudinary credentials not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in Vercel Environment Variables.',
      }, 500);
    }

    // ── Parse form ────────────────────────────────────────────────────
    const formData = await req.formData();
    const file      = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string) || 'ss-realty';

    if (!file) {
      return noCache({ success: false, error: 'No file provided' }, 400);
    }

    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : 'ss-realty';

    console.log('[Upload] File:', file.name, '| type:', file.type, '| size:', file.size, '| folder:', folder);

    // ── File-size guard ───────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return noCache(
        { success: false, error: `File too large. Max 50 MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)} MB` },
        400
      );
    }

    // ── Type check ────────────────────────────────────────────────────
    const isPdf   = file.type === 'application/pdf';
    const isImage = IMAGE_TYPES.has(file.type);

    if (!isImage && !isPdf) {
      return noCache(
        { success: false, error: `Invalid file type: ${file.type}` },
        400
      );
    }

    // ── Read bytes ────────────────────────────────────────────────────
    const bytes          = await file.arrayBuffer();
    const buffer         = Buffer.from(bytes);
    const originalSizeKB = Math.round(file.size / 1024);

    // ── Lazy-load Cloudinary (avoids bundling issues on Vercel) ───────
    console.log('[Upload] Loading cloudinary module dynamically...');
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    console.log('[Upload] Cloudinary configured successfully');

    // ── BRANCH A: IMAGE ───────────────────────────────────────────────
    if (isImage) {
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

      let maxWidth = 1920;
      let maxHeight = 1280;
      if (folder === 'ss-realty/blog') {
        maxWidth = 1200;
        maxHeight = 800;
      } else if (folder === 'ss-realty/thumbnails') {
        maxWidth = 600;
        maxHeight = 450;
      }

      console.log('[Upload] Uploading image to Cloudinary folder:', folder);
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

      const finalSizeKB  = Math.round(result.bytes / 1024);
      const savedPercent = Math.max(0, Math.round((1 - result.bytes / file.size) * 100));

      console.log('[Upload] Image upload success:', result.secure_url);

      return noCache({
        success:         true,
        url:             result.secure_url,
        publicId:        result.public_id,
        format:          'webp',
        width:           result.width,
        height:          result.height,
        originalSizeKB,
        convertedSizeKB: finalSizeKB,
        optimisedSizeKB: finalSizeKB,
        savedPercent,
        message: `Converted & optimised by Cloudinary. Saved ${savedPercent}% (${originalSizeKB} KB → ${finalSizeKB} KB)`,
      });
    }

    // ── BRANCH B: PDF ─────────────────────────────────────────────────
    console.log('[Upload] Uploading PDF to Cloudinary folder:', folder);
    const pdfBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;

    const pdfResult = await cloudinary.uploader.upload(pdfBase64, {
      folder,
      resource_type: 'raw',
      unique_filename: true,
      use_filename: false,
      eager: [{ flags: 'attachment' }],
      eager_async: false,
    });

    const pdfFinalSizeKB  = Math.round(pdfResult.bytes / 1024);
    const pdfSavedPercent = Math.max(0, Math.round((1 - pdfResult.bytes / file.size) * 100));

    console.log('[Upload] PDF upload success:', pdfResult.secure_url);

    return noCache({
      success:         true,
      url:             pdfResult.secure_url,
      publicId:        pdfResult.public_id,
      format:          'pdf',
      originalSizeKB,
      optimisedSizeKB: pdfFinalSizeKB,
      savedPercent:    pdfSavedPercent,
      message: `PDF uploaded & compressed. ${originalSizeKB} KB → ${pdfFinalSizeKB} KB`,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    console.error('[Upload API Error]:', msg);
    console.error('[Upload API Stack]:', stack);
    return noCache({ success: false, error: `Upload failed: ${msg}` }, 500);
  }
}
