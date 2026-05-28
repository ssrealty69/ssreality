import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import Blog from '@/models/Blog';
import Contact from '@/models/Contact';
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

    // Fetch live counts in parallel
    const [propertiesCount, blogsCount, leadsCount, jobsCount] = await Promise.all([
      Property.countDocuments({}),
      Blog.countDocuments({}),
      Contact.countDocuments({}),
      JobApplication.countDocuments({})
    ]);

    // Fetch recent 4 items for previews
    const [recentLeads, recentJobs] = await Promise.all([
      Contact.find({}).sort('-createdAt').limit(4).lean(),
      JobApplication.find({}).sort('-createdAt').limit(4).lean()
    ]);

    // Format IDs and Dates for 100% serialization safety
    const formattedLeads = recentLeads.map((lead: any) => ({
      ...lead,
      _id: lead._id.toString(),
      createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : undefined,
      updatedAt: lead.updatedAt ? new Date(lead.updatedAt).toISOString() : undefined
    }));

    const formattedJobs = recentJobs.map((job: any) => ({
      ...job,
      _id: job._id.toString(),
      createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
      updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : undefined
    }));

    return NextResponse.json({
      success: true,
      counts: {
        properties: propertiesCount,
        blogs: blogsCount,
        leads: leadsCount,
        jobs: jobsCount
      },
      previews: {
        leads: formattedLeads,
        jobs: formattedJobs
      }
    });
  } catch (error: any) {
    console.error('Fetch Admin Stats Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
