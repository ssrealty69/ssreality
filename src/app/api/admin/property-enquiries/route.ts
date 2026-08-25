import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import Agent from '@/models/Agent';

export const dynamic = 'force-dynamic';

// GET — list all property enquiries (admin only)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const enquiries = await PropertyEnquiry.find({})
      .populate('assignedAgentId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: enquiries });
  } catch (error: any) {
    console.error('Admin Property Enquiries GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE — remove a single property enquiry by id
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
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const deleted = await PropertyEnquiry.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Enquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Property enquiry deleted successfully' });
  } catch (error: any) {
    console.error('Admin Property Enquiries DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error', details: error.message },
      { status: 500 }
    );
  }
}
