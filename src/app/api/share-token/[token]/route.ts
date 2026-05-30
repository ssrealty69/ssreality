import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ShareToken from '@/models/ShareToken';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    await connectDB();

    const shareToken = await ShareToken.findOne({ token }).lean();

    if (!shareToken) {
      return NextResponse.json({ success: false, expired: true, error: 'Link expired or invalid' }, { status: 404 });
    }

    // Double check expiry (since MongoDB TTL indices can have up to 60s delay in deletion)
    if (new Date(shareToken.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, expired: true, error: 'Link expired' }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      data: shareToken.snapshot,
      expiresAt: shareToken.expiresAt
    });
  } catch (error) {
    console.error('Fetch share token error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
