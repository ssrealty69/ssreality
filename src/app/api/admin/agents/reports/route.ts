import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const agents = await Agent.find({}).select('name username phone isActive').lean();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const reports = await Promise.all(
      agents.map(async (agent) => {
        const agentId = (agent._id as any).toString();

        const allLeads = await AgentLead.find({ agentId }).lean();
        const totalLeads = allLeads.length;

        // Calls made today
        let callsToday = 0;
        allLeads.forEach((lead: any) => {
          if (lead.history) {
            callsToday += lead.history.filter((h: any) => {
              const d = new Date(h.calledAt);
              return d >= startOfDay && d <= endOfDay;
            }).length;
          }
        });

        // Disposition breakdown
        const dispositionMap: Record<string, number> = {};
        allLeads.forEach((lead: any) => {
          dispositionMap[lead.disposition] = (dispositionMap[lead.disposition] || 0) + 1;
        });

        return {
          agentId,
          name: agent.name,
          username: agent.username,
          isActive: agent.isActive,
          totalLeads,
          callsToday,
          interested: dispositionMap['interested'] || 0,
          visitDone: dispositionMap['visit_done'] || 0,
          followUp: dispositionMap['follow_up'] || 0,
          notInterested: dispositionMap['not_interested'] || 0,
          connected: dispositionMap['connected'] || 0,
          notConnected: (dispositionMap['not_connected'] || 0) + (dispositionMap['switch_off'] || 0) + (dispositionMap['not_reachable'] || 0),
          newLeads: dispositionMap['new'] || 0,
        };
      })
    );

    reports.sort((a, b) => b.callsToday - a.callsToday);

    return NextResponse.json({ success: true, data: reports });
  } catch (err: any) {
    console.error('Agent Report Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
