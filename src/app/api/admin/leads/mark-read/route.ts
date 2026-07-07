import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import AiLead from '@/models/AiLead';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { ids, type } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !type) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    await connectDB();

    let result;
    if (type === 'contact') {
      result = await Contact.updateMany({ _id: { $in: ids } }, { $set: { status: 'read' } });
    } else if (type === 'property-enquiry') {
      result = await PropertyEnquiry.updateMany({ _id: { $in: ids } }, { $set: { status: 'contacted' } });
    } else if (type === 'ai-lead') {
      result = await AiLead.updateMany({ _id: { $in: ids } }, { $set: { status: 'contacted' } });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error: any) {
    console.error('Mark Leads Read Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
