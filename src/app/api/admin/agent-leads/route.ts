import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const role = req.cookies.get('admin_role')?.value;
  const agentId = req.cookies.get('admin_user_id')?.value;

  if (token !== 'authenticated' || role !== 'agent' || !agentId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); 

    const query: Record<string, unknown> = { agentId: agentId };
    if (filter && filter !== 'all') {
      query.disposition = filter;
    }

    const leads = await AgentLead.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ success: true, data: leads });
  } catch (err: any) {
    console.error('Agent Leads GET Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
