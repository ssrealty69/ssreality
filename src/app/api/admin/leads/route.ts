import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Property from '@/models/Property';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const leads = await Contact.find({}).sort('-createdAt').lean();

    // Resolve property titles for leads having a property reference
    const resolvedLeads = await Promise.all(leads.map(async (lead: any) => {
      let propertyTitle = null;
      if (lead.propertyId && mongoose.Types.ObjectId.isValid(lead.propertyId)) {
        const prop = await Property.findById(lead.propertyId).select('title').lean();
        if (prop) {
          propertyTitle = (prop as any).title;
        }
      }
      return {
        ...JSON.parse(JSON.stringify(lead)),
        propertyTitle
      };
    }));
    
    return NextResponse.json({
      success: true,
      data: resolvedLeads
    });
  } catch (error: any) {
    console.error('Fetch Admin Leads Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID parameter is required' }, { status: 400 });
    }

    await connectDB();
    const deletedLead = await Contact.findByIdAndDelete(id);

    if (!deletedLead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Delete Admin Lead Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
