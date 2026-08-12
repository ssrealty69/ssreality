import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const name = req.nextUrl.searchParams.get('name') || 'Resume';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    let ext = 'pdf';
    if (contentType.includes('wordprocessingml')) ext = 'docx';
    else if (contentType.includes('msword')) ext = 'doc';
    else if (url.toLowerCase().endsWith('.pdf')) ext = 'pdf';
    else if (url.toLowerCase().endsWith('.docx')) ext = 'docx';
    else if (url.toLowerCase().endsWith('.doc')) ext = 'doc';

    const filename = `Resume-${name.replace(/\s+/g, '_')}.${ext}`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
