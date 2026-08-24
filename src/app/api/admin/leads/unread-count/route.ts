import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import AiLead from '@/models/AiLead';
import JobApplication from '@/models/JobApplication';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [contactCount, enquiryCount, aiLeadCount, jobCount] = await Promise.all([
      Contact.countDocuments({ status: 'new' }),
      PropertyEnquiry.countDocuments({ status: 'new' }),
      AiLead.countDocuments({ status: 'new' }),
      JobApplication.countDocuments({
        $or: [
          { status: 'new' },
          { isRead: false },
        ]
      })
    ]);

    const totalLeadsUnread = contactCount + enquiryCount + aiLeadCount;

    return NextResponse.json({
      success: true,
      unreadCount: totalLeadsUnread,
      unreadLeads: totalLeadsUnread,
      unreadJobs: jobCount,
    });
  } catch (error: any) {
    console.error('Fetch Unread Counts Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
