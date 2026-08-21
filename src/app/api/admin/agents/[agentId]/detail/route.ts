import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';
import { getLocalDateRange } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { agentId } = params;
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const disposition = searchParams.get('disposition') || 'all';

    const agent = await Agent.findById(agentId).lean();
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Build date range for call history filter
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (from && to) {
      const range = getLocalDateRange(from, to);
      startDate = range.start;
      endDate = range.end;
    }

    const agentObjId = (agent as any)._id.toString();
    const empId = (agent as any).employee_id || '';
    const agName = (agent as any).name || '';

    const agentMatchFilter = {
      $or: [
        { agentId: agentObjId },
        { agentId: empId },
        { agentName: new RegExp(`^${agName}$`, 'i') },
        { 'history.agentName': new RegExp(`^${agName}$`, 'i') },
      ]
    };

    const leadsQuery: Record<string, any> = { ...agentMatchFilter };
    if (disposition !== 'all') leadsQuery.disposition = disposition;

    const allLeads = await AgentLead.find(leadsQuery).sort({ updatedAt: -1 }).lean();

    // Compute stats over the date range
    let callsInRange = 0;
    let manualDialed = 0;
    const dispositionMap: Record<string, number> = {};

    const allLeadsForStats = await AgentLead.find(agentMatchFilter).lean();
    allLeadsForStats.forEach((lead: any) => {
      dispositionMap[lead.disposition] = (dispositionMap[lead.disposition] || 0) + 1;
      if (lead.history && startDate && endDate) {
        const rangeHistory = lead.history.filter((h: any) => {
          const d = new Date(h.calledAt);
          return d >= startDate! && d <= endDate!;
        });
        callsInRange += rangeHistory.length;
        if (rangeHistory.length > 0) manualDialed += 1;
      } else if (lead.history && !startDate) {
        callsInRange += lead.history.length;
        if (lead.history.length > 0) manualDialed += 1;
      }
    });

    const stats = {
      totalLeads: allLeadsForStats.length,
      callsInRange,
      manualDialed,
      interested: dispositionMap['interested'] || 0,
      visitScheduled: dispositionMap['follow_up'] || 0,
      visitDone: dispositionMap['visit_done'] || 0,
      followUp: dispositionMap['follow_up'] || 0,
      notInterested: dispositionMap['not_interested'] || 0,
      connected: dispositionMap['connected'] || 0,
      notConnected: (dispositionMap['not_connected'] || 0) + (dispositionMap['switch_off'] || 0) + (dispositionMap['not_reachable'] || 0),
      newLeads: dispositionMap['new'] || 0,
    };

    return NextResponse.json({
      success: true,
      agent: {
        _id: (agent as any)._id.toString(),
        name: (agent as any).name,
        username: (agent as any).username,
        employee_id: (agent as any).employee_id || '',
        isActive: (agent as any).isActive,
      },
      stats,
      leads: allLeads,
    });
  } catch (err: any) {
    console.error('Agent Detail Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
