import { NextRequest, NextResponse } from 'next/server';

// ─── Force server-rendered, never statically cached ───────────────────────
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── No-cache helper ──────────────────────────────────────────────────────
function json(body: object, status = 200): NextResponse {
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
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/avif', 'image/gif', 'image/heic', 'image/heif',
  'image/bmp', 'image/tiff', 'image/svg+xml',
]);

const ALLOWED_FOLDERS = new Set([
  'ss-realty/properties',
  'ss-realty/blog',
  'ss-realty/thumbnails',
  'ss-realty',
]);

// ─── Cloudinary REST Upload (no npm package — pure fetch) ─────────────────
// Uses Cloudinary's unsigned upload API directly.
// Docs: https://cloudinary.com/documentation/image_upload_api_reference
async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder: string,
  isImage: boolean,
): Promise<{ secure_url: string; public_id: string; bytes: number; width?: number; height?: number }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey    = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  // ── Generate SHA-1 signature for authenticated upload ──────────────────
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const resourceType = isImage ? 'image' : 'raw';

  // Build signature params (sorted alphabetically, no url/file)
  const eager = isImage ? 'c_limit,w_1920,h_1280/q_auto:best/f_webp' : undefined;
  const sigParams: Record<string, string> = {
    folder,
    timestamp,
    unique_filename: 'true',
    use_filename: 'false',
    ...(eager ? { eager } : {}),
    ...(isImage ? { format: 'webp' } : {}),
  };

  // Sort keys and build param string
  const paramStr = Object.keys(sigParams)
    .sort()
    .map((k) => `${k}=${sigParams[k]}`)
    .join('&') + apiSecret;

  // SHA-1 hash using Web Crypto API (available in Node.js 16+)
  const encoder = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-1', encoder.encode(paramStr));
  const signature = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // ── Build multipart form ────────────────────────────────────────────────
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimeType }));
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  form.append('folder', folder);
  form.append('unique_filename', 'true');
  form.append('use_filename', 'false');
  if (isImage) {
    form.append('format', 'webp');
    form.append('eager', eager!);
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  console.log('[Upload] POSTing to Cloudinary:', url);

  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json() as Record<string, unknown>;

  if (!res.ok) {
    const errMsg = (data?.error as Record<string, string>)?.message ?? JSON.stringify(data);
    throw new Error(`Cloudinary upload failed (${res.status}): ${errMsg}`);
  }

  return {
    secure_url: data.secure_url as string,
    public_id:  data.public_id  as string,
    bytes:      data.bytes      as number,
    width:      data.width      as number | undefined,
    height:     data.height     as number | undefined,
  };
}

// ─── POST handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const secret      = req.headers.get('x-admin-secret');
    const cookieToken = req.cookies.get('admin_token')?.value;
    const adminSecret = process.env.ADMIN_SECRET;

    const isAuthorized =
      (secret && adminSecret && secret === adminSecret) ||
      cookieToken === 'authenticated';

    if (!isAuthorized) {
      console.warn('[Upload] Unauthorized');
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    // ── Check env vars ────────────────────────────────────────────────────
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('[Upload] Env — cloud_name:', cloudName ?? 'MISSING', '| api_key:', !!apiKey, '| api_secret:', !!apiSecret);

    if (!cloudName || !apiKey || !apiSecret) {
      return json({
        success: false,
        error: 'Server misconfiguration: Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in Vercel Environment Variables.',
      }, 500);
    }

    // ── Parse form ────────────────────────────────────────────────────────
    const formData  = await req.formData();
    const file      = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string) || 'ss-realty';

    if (!file) {
      return json({ success: false, error: 'No file provided' }, 400);
    }

    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : 'ss-realty';
    console.log('[Upload] File:', file.name, '| type:', file.type, '| size:', file.size, '| folder:', folder);

    if (file.size > MAX_FILE_SIZE) {
      return json({ success: false, error: `File too large. Max 50 MB. Got ${(file.size / 1024 / 1024).toFixed(1)} MB` }, 400);
    }

    const isPdf   = file.type === 'application/pdf';
    const isImage = IMAGE_TYPES.has(file.type);

    if (!isImage && !isPdf) {
      return json({ success: false, error: `Unsupported file type: ${file.type}` }, 400);
    }

    const bytes          = await file.arrayBuffer();
    const buffer         = Buffer.from(bytes);
    const originalSizeKB = Math.round(file.size / 1024);

    // ── Upload ────────────────────────────────────────────────────────────
    const result = await uploadToCloudinary(buffer, file.type, folder, isImage);

    const finalSizeKB  = Math.round(result.bytes / 1024);
    const savedPercent = Math.max(0, Math.round((1 - result.bytes / file.size) * 100));

    console.log('[Upload] Success:', result.secure_url, '| saved:', savedPercent + '%');

    return json({
      success:         true,
      url:             result.secure_url,
      publicId:        result.public_id,
      format:          isImage ? 'webp' : 'pdf',
      width:           result.width,
      height:          result.height,
      originalSizeKB,
      convertedSizeKB: finalSizeKB,
      optimisedSizeKB: finalSizeKB,
      savedPercent,
      message: isImage
        ? `Converted & optimised by Cloudinary. Saved ${savedPercent}% (${originalSizeKB} KB → ${finalSizeKB} KB)`
        : `PDF uploaded. ${originalSizeKB} KB → ${finalSizeKB} KB`,
    });

  } catch (err: unknown) {
    const msg   = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack   : '';
    console.error('[Upload Error]', msg);
    console.error('[Upload Stack]', stack);
    return json({ success: false, error: `Upload failed: ${msg}` }, 500);
  }
}
