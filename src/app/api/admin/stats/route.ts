import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import Blog from '@/models/Blog';
import Contact from '@/models/Contact';
import JobApplication from '@/models/JobApplication';
import PropertyEnquiry from '@/models/PropertyEnquiry';

export const dynamic = 'force-dynamic';

let cachedStats: { timestamp: number; data: any } | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const secret = req.headers.get('x-admin-secret');
    if (token !== 'authenticated' && secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    if (cachedStats && (now - cachedStats.timestamp) < CACHE_TTL_MS) {
      return NextResponse.json(cachedStats.data, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    await connectDB();

    // Fetch live counts and recent items in parallel with lean projections
    const [
      propertiesCount,
      blogsCount,
      contactLeadsCount,
      propertyEnquiriesCount,
      jobsCount,
      recentLeads,
      recentJobs
    ] = await Promise.all([
      Property.countDocuments({}),
      Blog.countDocuments({}),
      Contact.countDocuments({}),
      PropertyEnquiry.countDocuments({}),
      JobApplication.countDocuments({}),
      Contact.find({}).select('name phone subject createdAt').sort({ createdAt: -1 }).limit(4).lean(),
      JobApplication.find({}).select('name position phone createdAt').sort({ createdAt: -1 }).limit(4).lean()
    ]);

    // Total leads = all contact form submissions + all property enquiries (includes brochures)
    const leadsCount = contactLeadsCount + propertyEnquiriesCount;

    // Format IDs for serialization safety
    const formattedLeads = recentLeads.map((lead: any) => ({
      _id: lead._id?.toString() || '',
      name: lead.name || '',
      phone: lead.phone || '',
      subject: lead.subject || '',
      createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : ''
    }));

    const formattedJobs = recentJobs.map((job: any) => ({
      _id: job._id?.toString() || '',
      name: job.name || '',
      position: job.position || '',
      phone: job.phone || '',
      createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : ''
    }));

    const responsePayload = {
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
    };

    cachedStats = {
      timestamp: now,
      data: responsePayload
    };

    return NextResponse.json(responsePayload, {
      headers: { 'X-Cache': 'MISS' }
    });
  } catch (error: any) {
    console.error('Fetch Admin Stats Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
