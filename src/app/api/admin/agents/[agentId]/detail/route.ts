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
  props: { params: Promise<{ agentId: string }> | { agentId: string } }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(props.params);
    const agentId = String(resolvedParams?.agentId || '');
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const disposition = searchParams.get('disposition') || 'all';

    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 });
    }

    let agent = null;
    if (agentId.match(/^[0-9a-fA-F]{24}$/)) {
      agent = await Agent.findById(agentId).lean();
    }
    if (!agent) {
      agent = await Agent.findOne({
        $or: [
          { employee_id: agentId },
          { employee_id: agentId.toUpperCase() },
          { username: agentId.toLowerCase() }
        ]
      }).lean();
    }

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
    if (disposition === 'visit_scheduled') {
      leadsQuery.$or = [
        { disposition: 'visit_scheduled' },
        { disposition: 'visitScheduled' },
        { 'visitDetails.date': { $exists: true, $ne: '' } },
        { disposition: 'follow_up', 'visitDetails.date': { $exists: true, $ne: '' } }
      ];
      leadsQuery.disposition = { $nin: ['booked', 'not_interested', 'visit_done'] };
    } else if (disposition === 'visit_done') {
      leadsQuery.disposition = 'visit_done';
    } else if (disposition !== 'all') {
      leadsQuery.disposition = disposition;
    }

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

    const assignedCount = allLeadsForStats.filter((l: any) => l.originalLeadType !== 'manual').length;
    const bookedCount = dispositionMap['booked'] || 0;
    const notInterestedCount = dispositionMap['not_interested'] || 0;
    const visitScheduledCount = (dispositionMap['visit_scheduled'] || 0) + (dispositionMap['visitScheduled'] || 0);
    const visitDoneCount = dispositionMap['visit_done'] || 0;

    const stats = {
      totalLeads: assignedCount,
      assigned: assignedCount,
      callsInRange,
      manualDialed,
      notInterested: notInterestedCount,
      visitScheduled: visitScheduledCount,
      visitDone: visitDoneCount,
      booked: bookedCount,
      bookingDone: bookedCount,
      interested: dispositionMap['interested'] || 0,
      followUp: dispositionMap['follow_up'] || 0,
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
