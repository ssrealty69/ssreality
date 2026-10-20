import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';
import { verifyAgentToken } from '@/lib/agentAuth';
import { triggerAutoSyncIfNeeded } from '@/lib/meta-sheets-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAgentToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    // Throttled (Redis, 10 min) background lead sync, runs after the response is sent
    after(() => triggerAutoSyncIfNeeded());

    await connectDB();

    // Today's date range (IST-aware: using UTC midnight boundaries)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const agentId = auth.agentId!;
    const isExecutive = 
      auth.agent?.role === 'director' || 
      auth.agent?.isExecutive === true || 
      auth.agent?.employee_id === 'SSR000' || 
      /yogesh/i.test(auth.agent?.name || '') || 
      auth.agent?.username === 'info@ssrealty.org';

    // All leads (For Director/Executive, fetch ALL company leads)
    const allLeads = isExecutive
      ? await AgentLead.find({}).lean()
      : await AgentLead.find({
          $or: [
            { agentId },
            { agentId: auth.agent?.employee_id },
            { agentName: new RegExp(`^${auth.agent?.name}$`, 'i') },
          ]
        }).lean();

    // Calls made today: leads with at least one history entry today
    const callsMadeToday = allLeads.filter((lead: any) =>
      lead.history?.some((h: any) => {
        const d = new Date(h.calledAt);
        return d >= startOfDay && d <= endOfDay;
      })
    ).length;

    // Today's unique call logs (across all leads)
    let totalCallLogsToday = 0;
    allLeads.forEach((lead: any) => {
      if (lead.history) {
        totalCallLogsToday += lead.history.filter((h: any) => {
          const d = new Date(h.calledAt);
          return d >= startOfDay && d <= endOfDay;
        }).length;
      }
    });

    // Follow-ups scheduled (disposition = follow_up, not yet visited)
    const followUps = allLeads.filter((l: any) => l.disposition === 'follow_up').length;

    // Interested leads (not yet converted to visit_done)
    const interestedLeads = allLeads.filter((l: any) => l.disposition === 'interested');
    const interestedCount = interestedLeads.length;

    // Visits conducted today (disposition updated to visit_done today)
    const visitsDoneToday = allLeads.filter((lead: any) => {
      if (lead.disposition !== 'visit_done') return false;
      const updated = new Date(lead.updatedAt);
      return updated >= startOfDay && updated <= endOfDay;
    }).length;

    // Visits scheduled (interested with visit details set, future date)
    const visitsScheduled = allLeads.filter((lead: any) => {
      if (lead.disposition !== 'interested') return false;
      if (!lead.visitDetails?.date) return false;
      const visitDate = new Date(lead.visitDetails.date);
      return visitDate >= startOfDay;
    }).length;

    // Client names for WhatsApp report (interested + visit_done)
    const reportClients = allLeads
      .filter((l: any) => l.disposition === 'interested' || l.disposition === 'visit_done')
      .map((l: any) => ({
        name: l.name,
        phone: l.phone,
        disposition: l.disposition,
        visitDetails: l.visitDetails,
      }));

    return NextResponse.json({
      success: true,
      data: {
        callsMadeToday: totalCallLogsToday,
        uniqueLeadsCalledToday: callsMadeToday,
        followUps,
        interested: interestedCount,
        visitsDoneToday,
        visitsScheduled,
        reportClients,
        agentName: auth.agent?.name,
      },
    });
  } catch (err: any) {
    console.error('Dashboard Stats Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
