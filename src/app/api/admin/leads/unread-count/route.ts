import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import AiLead from '@/models/AiLead';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [contactCount, enquiryCount, aiLeadCount] = await Promise.all([
      Contact.countDocuments({ status: 'new' }),
      PropertyEnquiry.countDocuments({ status: 'new' }),
      AiLead.countDocuments({ status: 'new' })
    ]);

    return NextResponse.json({
      success: true,
      unreadCount: contactCount + enquiryCount + aiLeadCount
    });
  } catch (error: any) {
    console.error('Fetch Unread Leads Count Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
