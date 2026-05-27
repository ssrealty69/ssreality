import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
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
    const applications = await JobApplication.find({}).sort('-createdAt').lean();
    
    // Map _id to string for serialization safety
    const formatted = JSON.parse(JSON.stringify(applications)).map((app: any) => ({
      ...app,
      _id: app._id.toString()
    }));

    return NextResponse.json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    console.error('Fetch Admin Jobs Error:', error);
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
    const deletedJob = await JobApplication.findByIdAndDelete(id);

    if (!deletedJob) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Delete Admin Job Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
