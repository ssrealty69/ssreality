import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const name = req.nextUrl.searchParams.get('name') || 'Resume';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    let downloadUrl = url;
    
    // Add fl_attachment to Cloudinary URLs to force download natively
    if (downloadUrl.includes('res.cloudinary.com') && downloadUrl.includes('/upload/')) {
      const formattedName = name.replace(/[^a-zA-Z0-9]/g, '_');
      // We don't append the extension to the custom filename flag because Cloudinary automatically appends the original extension
      downloadUrl = downloadUrl.replace('/upload/', `/upload/fl_attachment:Resume_${formattedName}/`);
    }

    // Redirect the browser directly to the URL.
    // Cloudinary will see it as a normal browser request and serve the attachment,
    // avoiding any 401 Unauthorized errors caused by programmatic Node fetch.
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('Download redirect error:', error);
    return NextResponse.json({ error: 'Failed to redirect to download' }, { status: 500 });
  }
}
