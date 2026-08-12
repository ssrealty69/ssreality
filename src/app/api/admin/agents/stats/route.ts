import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Agent ID required' }, { status: 400 });
    }

    await connectDB();

    // Today's date range
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const allLeads = await AgentLead.find({ agentId }).lean();

    const totalAssigned = allLeads.length;
    
    const interested = allLeads.filter((l: any) => l.disposition === 'interested').length;
    const followUps = allLeads.filter((l: any) => l.disposition === 'follow_up').length;
    
    // Visits completed
    const visitsDone = allLeads.filter((l: any) => l.disposition === 'visit_done').length;

    // Calls made today (unique leads called today)
    const callsMadeToday = allLeads.filter((lead: any) =>
      lead.history?.some((h: any) => {
        const d = new Date(h.calledAt);
        return d >= startOfDay && d <= endOfDay;
      })
    ).length;

    const recentLeads = [...allLeads].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);

    return NextResponse.json({
      success: true,
      stats: {
        totalAssigned,
        interested,
        followUps,
        visitsDone,
        callsMadeToday
      },
      recentLeads
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
