import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'brochure.pdf';

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only allow downloads from known trusted domains
  const allowedDomains = ['res.cloudinary.com', 'cloudinary.com'];
  let isAllowed = false;
  try {
    const parsed = new URL(url);
    isAllowed = allowedDomains.some(d => parsed.hostname.endsWith(d));
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!isAllowed) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SSRealty-Bot/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Brochure download proxy error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
