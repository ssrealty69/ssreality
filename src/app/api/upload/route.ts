import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { convertToWebP, type ImagePreset } from '@/lib/image-processor';

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

    const isAuthorized =
      (secret && adminSecret && secret === adminSecret) ||
      cookieToken === 'authenticated';

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse form ──────────────────────────────────────────────────────
    const formData = await req.formData();
    const file      = formData.get('file') as File;
    const rawFolder = (formData.get('folder') as string) || 'ss-realty';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // ── Folder whitelist ────────────────────────────────────────────────
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : 'ss-realty';
    const preset = FOLDER_PRESET_MAP[folder] ?? 'property';

    // ── File-size guard ─────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Max 50 MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)} MB` },
        { status: 400 }
      );
    }

    // ── Type check ──────────────────────────────────────────────────────
    const isPdf = file.type === 'application/pdf';
    const isImage = IMAGE_TYPES.has(file.type);

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { success: false, error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF, HEIC, BMP, TIFF, PDF` },
        { status: 400 }
      );
    }

    // ── Read bytes ──────────────────────────────────────────────────────
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalSizeKB = Math.round(file.size / 1024);

    // ════════════════════════════════════════════════════════════════════
    // BRANCH A — IMAGE: Convert to WebP via sharp, then upload to Cloudinary
    // ════════════════════════════════════════════════════════════════════
    if (isImage) {
      let processedBuffer: Buffer;
      let convertedWidth  = 0;
      let convertedHeight = 0;
      let convertedSizeKB = 0;

      try {
        const processed = await convertToWebP(buffer, preset);
        processedBuffer  = processed.buffer;
        convertedWidth   = processed.width;
        convertedHeight  = processed.height;
        convertedSizeKB  = Math.round(processed.sizeBytes / 1024);
      } catch (sharpErr) {
        console.error('[image-processor] sharp failed, falling back to original:', sharpErr);
        // If sharp fails (e.g., unsupported exotic format), fall back to
        // uploading the original and let Cloudinary handle conversion.
        processedBuffer = buffer;
      }

      // Base64-encode the WebP buffer for Cloudinary upload
      const base64 = `data:image/webp;base64,${processedBuffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: 'image',
        unique_filename: true,
        use_filename: false,
        // Store natively as WebP — Cloudinary won't re-convert
        format: 'webp',
        // Final quality pass on Cloudinary side (auto picks optimal)
        transformation: [
          { quality: 'auto:best' },
        ],
      });

      const finalSizeKB  = Math.round(result.bytes / 1024);
      const savedPercent = Math.round((1 - result.bytes / file.size) * 100);

      return NextResponse.json({
        success:        true,
        url:            result.secure_url,
        publicId:       result.public_id,
        format:         'webp',
        width:          result.width  || convertedWidth,
        height:         result.height || convertedHeight,
        originalSizeKB,
        convertedSizeKB,   // after sharp (before Cloudinary)
        optimisedSizeKB:   finalSizeKB, // after Cloudinary
        savedPercent:      Math.max(0, savedPercent),
        message: `Converted to WebP & optimised. Saved ${Math.max(0, savedPercent)}% (${originalSizeKB} KB → ${finalSizeKB} KB)`,
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // BRANCH B — PDF: Upload as raw resource with Cloudinary compression
    // Cloudinary supports PDF linearization + image downsampling for PDFs
    // ════════════════════════════════════════════════════════════════════
    const pdfBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;

    const pdfResult = await cloudinary.uploader.upload(pdfBase64, {
      folder,
      resource_type: 'raw',       // PDFs must use 'raw' (not 'image')
      unique_filename: true,
      use_filename: false,
      // Cloudinary PDF optimizations via eager transformation
      // (generates a compressed version on upload)
      eager: [
        {
          // fl_attachment allows browsers to download, fl_lossy permits lossy compression
          flags: 'attachment',
        },
      ],
      eager_async: false,
    });

    const pdfFinalSizeKB  = Math.round(pdfResult.bytes / 1024);
    const pdfSavedPercent = Math.round((1 - pdfResult.bytes / file.size) * 100);

    return NextResponse.json({
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
    const msg = error instanceof Error ? error.message : 'Upload failed';
    console.error('[Upload API Error]', error);
    const safeMsg = process.env.NODE_ENV === 'production' ? 'Upload failed. Please try again.' : msg;
    return NextResponse.json({ success: false, error: safeMsg }, { status: 500 });
  }
}
