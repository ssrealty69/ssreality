import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';
import { verifyAgentToken } from '@/lib/agentAuth';

export const dynamic = 'force-dynamic';

// GET: Fetch all assigned leads for the logged-in agent
export async function GET(req: NextRequest) {
  const auth = await verifyAgentToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // e.g. 'new', 'interested', 'follow_up', 'all'

    const query: Record<string, unknown> = { agentId: auth.agentId };
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
