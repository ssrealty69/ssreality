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

    // Format IDs for serialization safety
    const formattedLeads = JSON.parse(JSON.stringify(recentLeads)).map((lead: any) => ({
      ...lead,
      _id: lead._id.toString()
    }));

    const formattedJobs = JSON.parse(JSON.stringify(recentJobs)).map((job: any) => ({
      ...job,
      _id: job._id.toString()
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
